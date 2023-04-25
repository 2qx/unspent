import {
  binToHex,
  hexToBin,
  bigIntToBinUintLE,
  instantiateSha256,
} from "@bitauth/libauth";
import type { Artifact, Utxo, NetworkProvider } from "cashscript";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions, DUST_UTXO_THRESHOLD } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import {
  toHex,
  getRandomIntWeak,
  sum,
  decodeNullDataScript,
  binToBigInt,
} from "../../common/util.js";
import { artifact as v1 } from "./cash/v1.js";

export class Mine extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "M";
  private static fn: string = "execute";
  public static minPayout: bigint = DUST_UTXO_THRESHOLD + 392n + 10n;

  constructor(
    public period: bigint | number = 1n,
    public payout: bigint | number = 5000n,
    public difficulty: bigint | number = 3n,
    public canary: string = binToHex(new Uint8Array(7)),
    public options: ContractOptions = DefaultOptions
  ) {
    let script: Artifact;
    if (options.version === 1) {
      script = v1;
    } else {
      throw Error(`Unrecognized Mine Contract Version`);
    }

    if (payout < Mine.minPayout)
      throw Error(`Payout below minimum usable level ${Mine.minPayout}`);

    super(options.network!, script, [
      BigInt(period),
      BigInt(payout),
      BigInt(difficulty),
      hexToBin(canary),
    ]);
    this.options = options;
  }

  static fromString(str: string, network = "mainnet"): Mine {
    const p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(this.c == p.code))
      throw `non-${this.name} serialized string passed to ${this.name} constructor`;

    if (p.options.version != 1)
      throw Error(`${this.name} contract version not recognized`);

    if (p.args.length != 4)
      throw `invalid number of arguments ${p.args.length}`;
    const period = BigInt(parseInt(p.args.shift()!));
    const payout = BigInt(parseInt(p.args.shift()!));
    const difficulty = BigInt(parseInt(p.args.shift()!));
    const canary = p.args.shift()!;

    const mine = new Mine(period, payout, difficulty, canary, p.options);

    // check that the address is correct
    mine.checkLockingBytecode(p.lockingBytecode);
    return mine;
  }

  // Create a Mine contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Mine {
    const p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (p.options.version !== 1)
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    const period = binToBigInt(p.args.shift()!);
    const payout = binToBigInt(p.args.shift()!);
    const difficulty = binToBigInt(p.args.shift()!);
    const canary = binToHex(p.args.shift()!);

    const mine = new Mine(period, payout, difficulty, canary, p.options);

    // check that the address
    mine.checkLockingBytecode(p.lockingBytecode);
    return mine;
  }

  static async getSpendableBalance(
    opReturn: Uint8Array | string,
    network = "mainnet",
    networkProvider: NetworkProvider,
    blockHeight: number
  ): Promise<bigint> {
    const p = this.parseOpReturn(opReturn, network);
    const period = binToBigInt(p.args.shift()!);
    const payout = binToBigInt(p.args.shift()!);
    const utxos = await networkProvider.getUtxos(p.address);
    const spendableUtxos = utxos.map((u: Utxo) => {
      // @ts-ignore
      if (u.height !== 0) {
        // @ts-ignore
        if (blockHeight - u.height > period) {
          return u.satoshis;
        } else {
          return 0n;
        }
      } else {
        return 0n;
      }
    });
    const spendable =
      spendableUtxos.length > 0 ? spendableUtxos.reduce(sum) : 0n;
    if (spendable > payout) {
      return spendable;
    } else {
      return 0n;
    }
  }

  static getExecutorAllowance(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): bigint {
    const p = this.parseOpReturn(opReturn, network);
    return binToBigInt(p.args.at(1)!);
  }

  override toString() {
    return [
      `${Mine.c}`,
      `${this.options!.version}`,
      `${this.period}`,
      `${this.payout}`,
      `${this.difficulty}`,
      `${this.canary}`,
      `${this.getLockingBytecode()}`,
    ].join(Mine.delimiter);
  }

  override asText(): string {
    return `A mineable contract, with difficulty ${this.difficulty}, paying ${this.payout} (sat), every ${this.period} blocks`;
  }

  toOpReturn(hex = false): string | Uint8Array {
    const chunks = [
      Mine._PROTOCOL_ID,
      Mine.c,
      toHex(this.options!.version!),
      toHex(this.period),
      toHex(this.payout),
      toHex(this.difficulty),
      `0x${this.canary}`,
      "0x" + this.getLockingBytecode(true),
    ];
    return this.asOpReturn(chunks, hex);
  }

  async getNonce(verbose = false): Promise<string> {
    let nonce = new Uint8Array([]);
    let result = new Uint8Array([]);
    let mined = false;
    let best = 9007199254740991;

    const sha256 = await instantiateSha256();

    if (verbose) console.log("mining...");
    // keep mining 'til the number of zeros are reached
    while (!mined) {
      const nonceNumber = getRandomIntWeak(9007199254740991);
      nonce = bigIntToBinUintLE(BigInt(nonceNumber));
      const msg = new Uint8Array([
        ...hexToBin(this.getRedeemScriptHex()),
        ...nonce,
      ]);
      result = sha256.hash(msg);
      const newBest = result.slice(0, Number(this.difficulty)).reduce(sum);
      if (newBest <= best) {
        best = newBest;
        if (verbose) console.log(newBest, result.slice(0, Number(this.difficulty)));
      }
      if (result.slice(0, Number(this.difficulty)).reduce(sum) === 0) mined = true;
    }

    // if the number is smaller than the space allowed, prepend it by adding zeros to the right
    if (nonce.length < this.canary.length / 2) {
      const zeros = this.canary.length / 2 - nonce.length;
      nonce = new Uint8Array([...nonce, ...new Uint8Array(zeros)]);
    }
    const nonceHex = binToHex(nonce);
    if (verbose) console.log("success: ", nonceHex);
    return nonceHex;
  }

  getOutputLockingBytecodes(hex = true) {
    hex;
    return [];
  }

  async execute(
    exAddress?: string,
    fee?: bigint,
    utxos?: Utxo[],
    nonce?: string | Uint8Array,
    verbose = false
  ): Promise<string> {
    const balance = await this.getBalance();
    let fn = this.getFunction(Mine.fn)!;
    const newPrincipal = balance - BigInt(this.payout);
    const minerFee = fee ? fee : BigInt(400);
    const reward = BigInt(this.payout) - minerFee;

    if (!nonce) {
      this.canary = await this.getNonce(verbose);
    } else {
      this.canary = typeof nonce === "string" ? nonce : binToHex(nonce);
    }

    const nextContract = new Mine(
      this.period,
      this.payout,
      this.difficulty,
      this.canary,
      this.options
    );
    const opReturn = nextContract.toOpReturn(false);
    const chunks = decodeNullDataScript(opReturn).map(
      (c) => "0x" + binToHex(c)
    );

    const to = [
      {
        to: nextContract.getAddress(),
        amount: BigInt(newPrincipal),
      },
    ];

    if (exAddress)
      to.push({
        to: exAddress,
        amount: BigInt(reward),
      });

    const canaryHex = "0x" + this.canary;

    fn = this.getFunction(Mine.fn)!;
    let tx = fn(canaryHex)!;
    if (utxos) tx = tx.from(utxos);
    const size = await tx
      .withOpReturn(chunks)
      .to(to)
      .withAge(Number(this.period))
      .withHardcodedFee(minerFee)
      .build();

    if (exAddress) {
      const minerFee = fee ? fee : BigInt(size.length) / 2n;
      //console.log(minerFee)
      const reward = BigInt(this.payout) - (minerFee + 10n);
      to.pop();
      to.push({
        to: exAddress,
        amount: reward,
      });
    }

    // assure cluster is connected
    // @ts-ignore
    await this.provider?.connectCluster();
    tx = fn(canaryHex)!;
    if (utxos) tx = tx.from(utxos);
    const payTx = await tx
      .withOpReturn(chunks)
      .to(to)
      .withAge(Number(this.period))
      .withoutChange()
      .send();
    return payTx.txid;
  }
}
