import {
  binToHex,
  cashAddressToLockingBytecode,
  hexToBin,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import type { Artifact, Utxo, NetworkProvider } from "cashscript";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import {
  DefaultOptions,
  _PROTOCOL_ID,
  DUST_UTXO_THRESHOLD,
  SPECIALS
} from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import {
  assurePkh,
  binToBigInt,
  deriveLockingBytecode,
  deriveLockingBytecodeHex,
  derivePublicKeyHash,
  getPrefixFromNetwork,
  sum,
  toHex,
} from "../../common/util.js";
import { artifact as v0 } from "./cash/v0.js";
import { artifact as v1 } from "./cash/v1.js";
import { artifact as v2 } from "./cash/v2.js";

export class Perpetuity extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "P";
  private static fn: string = "execute";
  public recipientLockingBytecode: Uint8Array;
  public static minAllowance: bigint = DUST_UTXO_THRESHOLD + 220n + 50n;

  constructor(
    public period: bigint | number = 4000n,
    public address: string,
    public executorAllowance: bigint | number,
    public decay: bigint | number,
    public options: ContractOptions = DefaultOptions
  ) {

    let script: Artifact;

    let lock: Uint8Array;

    if (options.version === 2) {
      script = v2;
      const lockingBytecode = cashAddressToLockingBytecode(address);
      if (typeof lockingBytecode === "string") throw lockingBytecode;
      executorAllowance = executorAllowance ? executorAllowance : 1500n;
      lock = lockingBytecode.bytecode;
    } else if (options.version === 1) {
      script = v1;
      const lockingBytecode = cashAddressToLockingBytecode(address);
      if (typeof lockingBytecode === "string") throw lockingBytecode;
      lock = lockingBytecode.bytecode;
    } else if (options.version === 0) {
      script = v0;
      assurePkh(address)
      const publicKeyHash = derivePublicKeyHash(address)
      lock = publicKeyHash
    } else {
      throw Error("Unrecognized Perpetuity Version");
    }

    if ((options.version >= 2) && (executorAllowance < Perpetuity.minAllowance))
      throw Error(
        `Executor Allowance below usable threshold ${Perpetuity.minAllowance}`
      );

    super(options.network!, script, [
      BigInt(period),
      lock!,
      BigInt(executorAllowance),
      BigInt(decay),
    ]);
    this.recipientLockingBytecode = deriveLockingBytecode(address);
    if(SPECIALS.includes(binToHex(lock))) throw Error("Contract is too special")
    this.options = options;
  }

  refresh(): void {
    this._refresh([
      BigInt(this.period),
      this.recipientLockingBytecode,
      BigInt(this.executorAllowance),
      BigInt(this.decay)
    ]);
  }

  static fromString(str: string, network = "mainnet"): Perpetuity {
    const p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(this.c == p.code))
      throw `non-${this.name} serialized string passed to ${this.name} constructor`;

    if (![0, 1, 2].includes(p.options.version))
      throw Error(`${this.name} contract version not recognized`);

    if (p.args.length != 4)
      throw `invalid number of arguments ${p.args.length}`;

    const period = BigInt(parseInt(p.args.shift()!));

    const lock = p.args.shift()!;

    const prefix = getPrefixFromNetwork(network);
    const address = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    const executorAllowance = BigInt(parseInt(p.args.shift()!));
    const decay = BigInt(parseInt(p.args.shift()!));

    const perpetuity = new Perpetuity(
      period,
      address,
      executorAllowance,
      decay,
      p.options
    );

    // check that the address matches
    perpetuity.checkLockingBytecode(p.lockingBytecode);
    return perpetuity;
  }

  // Create a Perpetuity contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Perpetuity {
    const p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (![0, 1, 2].includes(p.options.version))
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    const period = binToBigInt(p.args.shift()!);
    const lock = p.args.shift()!;

    const prefix = getPrefixFromNetwork(network);
    const address = lockingBytecodeToCashAddress(lock, prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    const executorAllowance = binToBigInt(p.args.shift()!);
    const decay = binToBigInt(p.args.shift()!);

    const perpetuity = new Perpetuity(
      period,
      address,
      executorAllowance,
      decay,
      p.options
    );

    // check that the address matches
    perpetuity.checkLockingBytecode(p.lockingBytecode);
    return perpetuity;
  }

  static async getSpendableBalance(
    opReturn: Uint8Array | string,
    network = "mainnet",
    networkProvider: NetworkProvider,
    blockHeight: number
  ): Promise<bigint> {
    const p = this.parseOpReturn(opReturn, network);
    const period = binToBigInt(p.args.shift()!);
    // discard the address
    p.args.shift()!;
    const decay = binToBigInt(p.args.shift()!);
    const utxos = await networkProvider.getUtxos(p.address);
    const spendableUtxos = utxos.map((u) => {
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
    if (spendableUtxos.length > 0) {
      const spendableBalance = spendableUtxos.reduce(sum);
      const dustLocked = decay * DUST_UTXO_THRESHOLD;
      const spendable = spendableBalance - dustLocked;
      return spendable > 0 ? spendable : 0n;
    } else {
      return 0n;
    }
  }

  static getExecutorAllowance(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): bigint {
    const p = this.parseOpReturn(opReturn, network);
    p.args.pop()!;
    return binToBigInt(p.args.pop()!);
  }

  override toString() {
    return [
      `${Perpetuity.c}`,
      `${this.options!.version}`,
      `${this.period}`,
      `${deriveLockingBytecodeHex(this.address)}`,
      `${this.executorAllowance}`,
      `${this.decay}`,
      `${this.getLockingBytecode()}`,
    ].join(Perpetuity.delimiter);
  }

  override asText(): string {
    return `Perpetuity to pay 1/${this.decay} the input, every ${this.period} blocks, after a ${this.executorAllowance} (sat) executor allowance`;
  }

  override asCommand(): string{
    let chipnetFlag = this.options.network ==  'mainnet' ? '': "--chipnet ";
    return `unspent perpetuity  ${chipnetFlag} --version ${this.options.version} --address ${this.address} --period ${this.period} --allowance ${this.executorAllowance} --decay ${this.decay}`;
  }

  toOpReturn(hex = false): string | Uint8Array {
    const chunks = [
      Perpetuity._PROTOCOL_ID,
      Perpetuity.c,
      toHex(this.options!.version!),
      toHex(this.period),
      "0x" + deriveLockingBytecodeHex(this.address),
      toHex(this.executorAllowance),
      toHex(this.decay),
      "0x" + this.getLockingBytecode(),
    ];
    return this.asOpReturn(chunks, hex);
  }

  getOutputLockingBytecodes(hex = true) {
    if (hex) {
      return [binToHex(this.recipientLockingBytecode)];
    } else {
      return [this.recipientLockingBytecode];
    }
  }

  isSpecial(): boolean {
    let out = this.getOutputLockingBytecodes(true).pop()! as string;
    return SPECIALS.includes(out)
  }

  async asSeries() {
    const currentHeight = await this.provider!.getBlockHeight();
    const currentTime = Number(Math.floor(Date.now() / 1000));
    let utxos = await this.getUtxos();

    let series: any = [];
    if (!utxos || utxos?.length == 0)
      utxos = [
        {
          satoshis: 10000000n,
          txid: "<example 10,000,000 (0.1 BCH) unspent output>",
          vout: 0,
          // @ts-ignore
          height: 0,
        },
      ];
    if (utxos) {
      for (const utxo of utxos) {
        const time = [];
        const payout = [];
        const installment = [];
        const principal = [];
        const allowance = [];
        let blocksToWait = 0;
        // @ts-ignore
        if (utxo.height <= 0) {
          blocksToWait = Number(this.period);
        } else {
          // @ts-ignore
          blocksToWait = Number(this.period) - Number(currentHeight - utxo.height);
        }
        const seriesStartTime = currentTime + blocksToWait * 600;
        installment.push(
          (utxo.satoshis / BigInt(this.decay)) - BigInt(this.executorAllowance)
        );
        payout.push(Number(installment.at(-1)!));
        principal.push(Number(utxo.satoshis - installment.at(-1)!));
        allowance.push(Number(this.executorAllowance));
        const intervalSeconds = Number(this.period) * 600;
        let nextPayout = 0;
        let lastPrincipal = principal.at(-1)!;
        for (let i = 1; i < 5000; i++) {
          lastPrincipal = Number(principal.at(-1)!);
          nextPayout = lastPrincipal / Number(this.decay);
          if (nextPayout < Number(DUST_UTXO_THRESHOLD)) {
            break;
          }
          time.push(Number(seriesStartTime + i * intervalSeconds));
          installment.push(Number(nextPayout));
          payout.push(payout.at(-1)! + nextPayout);
          principal.push(Number(lastPrincipal - nextPayout - Number(this.executorAllowance)));
          allowance.push(Number(this.executorAllowance) * i);
        }

        const utxoId = `${utxo.txid}:${utxo.vout.toString()}`;
        series.push({
          id: utxoId,
          data: {
            time: time,
            principal: principal,
            payout: payout,
            executorAllowance: allowance,
          },
        });
      } // for utxos
    } // if utxos
    return series;
  }

  async execute(
    exAddress?: string,
    fee?: bigint,
    utxos?: Utxo[],
    debug?: boolean
  ): Promise<string> {
    let balance = 0n;

    // Filter to inputs of sufficient age
    if (!utxos) utxos = await this.getUtxos(Number(this.period));

    // If the contract is version 2 or higher, restrict to one input.
    if (utxos) {
      if (this.options!.version! >= 2 && utxos!.length > 1) utxos = utxos.slice(-1)
    }
    
    if (utxos && utxos?.length > 0) {
      balance = utxos.reduce((a, b) => a + b.satoshis, 0n);
    } else {
      balance = await this.getBalance();
    }
    if (balance == 0n) {
      if (!debug) { return "" }
    }

    const fn = this.getFunction(Perpetuity.fn)!;
    let installment = (balance / BigInt(this.decay)) ;
    let newPrincipal = balance - installment - BigInt(this.executorAllowance);

    // round up
    installment += 1n;
    newPrincipal += 1n;

    let to = []
    if (this.options.version == 2 && installment < 1000) {
      to = [
        {
          to: this.address,
          amount: installment + newPrincipal,
        }
      ];
    } else {
      to = [
        {
          to: this.address,
          amount: installment,
        },
        {
          to: this.getAddress(),
          amount: newPrincipal,
        },
      ];
    }


    let executorFee = DUST_UTXO_THRESHOLD;
    if (typeof exAddress === "string" && exAddress)
      to.push({
        to: exAddress,
        amount: DUST_UTXO_THRESHOLD,
      });

    let estimator = fn();

    if (utxos) estimator = estimator.from(utxos);

    estimator!
    .to(to)
    .withAge(Number(this.period))
    .withoutChange();
    const size = await estimator.build();

    const minerFee = fee ? BigInt(fee) : BigInt(size.length) / 2n + 2n;
     
    if (exAddress) {

      executorFee = BigInt(this.executorAllowance) - minerFee;
      if (executorFee > DUST_UTXO_THRESHOLD) {
        to.pop();
        to.push({
          to: exAddress,
          amount: executorFee,
        });
      }
    }

    let tx = fn();
    if (utxos) tx = tx.from(utxos);
    tx!.to(to).withAge(Number(this.period)).withoutChange();

    let txn = ""
    if (debug) {
      txn = await this.asBitAuthUrl(tx)
    } else {
      txn = (await tx.send()).txid;
    }
    return txn;

  }
}
