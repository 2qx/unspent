import {
  binToHex,
  hexToBin,
  cashAddressToLockingBytecode,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import type { Artifact, Utxo, NetworkProvider } from "cashscript";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions, DUST_UTXO_THRESHOLD, SPECIALS } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import {
  getPrefixFromNetwork,
  deriveLockingBytecodeHex,
  binToNumber,
  toHex,
  parseBigInt,
  sum,
  binToBigInt,
} from "../../common/util.js";
import { artifact as v1 } from "./cash/v1.js";
import { artifact as v2 } from "./cash/v2.js";

export class Annuity extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "A"; //A
  private static fn: string = "execute";
  public static minAllowance: bigint = DUST_UTXO_THRESHOLD + 222n + 40n;

  public recipientLockingBytecode: Uint8Array;

  constructor(
    public period: bigint | number = 4000n,
    public recipientAddress: any,
    public installment: bigint | number,
    public executorAllowance: bigint | number = 800n,
    public options: ContractOptions = DefaultOptions
  ) {
    let script: Artifact;
    if (options.version === 2) {
      script = v2;
      if (installment < DUST_UTXO_THRESHOLD)
        throw Error("Installment below dust threshold");
      if (executorAllowance < Annuity.minAllowance)
        throw Error("Executor Allowance below usable threshold");
    } else if (options.version === 1) {
      script = v1;
    } else {
      throw Error("Unrecognized Annuity Version");
    }



    const lock = cashAddressToLockingBytecode(recipientAddress);
    if (typeof lock === "string") throw lock;

    super(options.network!, script, [
      BigInt(period),
      lock.bytecode,
      BigInt(installment),
      BigInt(executorAllowance),
    ]);
    this.recipientLockingBytecode = lock.bytecode;
    if(SPECIALS.includes(binToHex(lock.bytecode))) throw Error("Contract is too special")
    this.options = options;
  }

  refresh(): void {
    this._refresh([
      BigInt(this.period),
      this.recipientLockingBytecode,
      BigInt(this.installment),
      BigInt(this.executorAllowance),
    ]);
  }

  static fromString(str: string, network = "mainnet"): Annuity {
    const p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(Annuity.c == p.code))
      throw "non-faucet serialized string passed to faucet constructor";

    if (![1, 2].includes(p.options.version))
      throw Error(`${this.name} contract version not recognized`);
    if (p.args.length != 4)
      throw `invalid number of arguments ${p.args.length}`;

    const period = parseBigInt(p.args.shift()!);
    const lock = p.args.shift()!;
    const prefix = getPrefixFromNetwork(network);
    const address = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);
    const installment = parseBigInt(p.args.shift()!);
    const executorAllowance = parseBigInt(p.args.shift()!);
    const annuity = new Annuity(
      period,
      address,
      installment,
      executorAllowance,
      p.options
    );

    // check that the address is the same
    annuity.checkLockingBytecode(p.lockingBytecode);
    return annuity;
  }

  // Create a Annuity contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Annuity {
    const p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (![1, 2].includes(p.options.version))
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    const period = binToBigInt(p.args.shift()!);
    const lock = p.args.shift()!;

    const prefix = getPrefixFromNetwork(network);
    const address = lockingBytecodeToCashAddress(lock, prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    let [installment, executorAllowance] = [30000n, 3000n];
    installment = binToBigInt(p.args.shift()!);
    executorAllowance = binToBigInt(p.args.shift()!);


    const annuity = new Annuity(
      period,
      address,
      installment,
      executorAllowance,
      p.options
    );

    if(annuity.isSpecial()) throw Error("Contract is too special")
    // check that the address is the same
    annuity.checkLockingBytecode(p.lockingBytecode);
    return annuity;
  }

  static getExecutorAllowance(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): bigint {
    const p = this.parseOpReturn(opReturn, network);
    return binToBigInt(p.args.pop()!);
  }

  static async getSpendableBalance(
    opReturn: Uint8Array | string,
    network = "mainnet",
    networkProvider: NetworkProvider,
    blockHeight: number
  ): Promise<bigint> {
    const p = this.parseOpReturn(opReturn, network);
    const period = binToNumber(p.args.shift()!);
    // discard the address
    p.args.shift()!;
    const installment = binToNumber(p.args.shift()!);
    const utxos = await networkProvider.getUtxos(p.address);
    const spendableUtxos = utxos.map((u) => {
      // @ts-ignore
      if (u.height !== 0) {
        // @ts-ignore
        if (blockHeight - u.height > period) {
          return u.satoshis;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });

    if (spendableUtxos.length > 0) {
      const spendableBalance = BigInt(spendableUtxos.reduce(sum));
      const remainder = spendableBalance % BigInt(installment);
      const spendable = spendableBalance - BigInt(remainder);
      return spendable > 0n ? spendable : 0n;
    } else {
      return 0n;
    }
  }

  override toString() {
    return [
      `${Annuity.c}`,
      `${this.options!.version!}`,
      `${this.period}`,
      `${deriveLockingBytecodeHex(this.recipientAddress)}`,
      `${this.installment}`,
      `${this.executorAllowance}`,
      `${this.getLockingBytecode()}`,
    ].join(Annuity.delimiter);
  }

  override asText() {
    return `Annuity paying ${this.installment} (sat), every ${this.period} blocks, after a ${this.executorAllowance} (sat) executor allowance`;
  }

  override asCommand(): string{
    let chipnetFlag = this.options.network ==  'mainnet' ? "": "--chipnet ";
    return `unspent annuity --version ${this.options.version} ${chipnetFlag} --address ${this.recipientAddress} --period ${this.period} --allowance ${this.executorAllowance} --installment ${this.installment}`;
  }

  toOpReturn(hex = false): string | Uint8Array {
    const chunks = [
      Annuity._PROTOCOL_ID,
      Annuity.c,
      toHex(this.options!.version!),
      toHex(this.period),
      "0x" + deriveLockingBytecodeHex(this.recipientAddress),
      toHex(this.installment),
      toHex(this.executorAllowance),
      "0x" + this.getLockingBytecode(true),
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

  async asSeries(): Promise<any> {
    const currentHeight = await this.provider!.getBlockHeight();
    const currentTime = Math.floor(Date.now() / 1000);
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
        let blocksToWait = 0;
        // @ts-ignore
        if (utxo.height == 0) {
          blocksToWait = Number(this.period);
        } else {
          // @ts-ignore
          blocksToWait = Number(this.period) - (currentHeight - utxo.height);
        }
        const seriesStartTime = currentTime + blocksToWait * 600;

        const initialPrincipal = utxo.satoshis;
        const seriesLength =
          (initialPrincipal - DUST_UTXO_THRESHOLD) /
          (BigInt(this.installment) + BigInt(this.executorAllowance));

        const principal = [];
        const time = [];
        const totalFee = [];
        const totalPayout = [];
        const installment = BigInt(this.installment) + BigInt(this.executorAllowance);
        const intervalSeconds = Number(this.period) * 600;
        for (var i = 0; i < seriesLength; i++) {
          if(installment > 1000n){
            time.push(Number(seriesStartTime + i * intervalSeconds));
            principal.push(Number(initialPrincipal) - Number(installment) * i);
            totalPayout.push(Number(this.installment) * i);
            totalFee.push(Number(this.executorAllowance) * i);
          }else{
            time.push(Number(seriesStartTime + i * intervalSeconds));
            principal.push(0);
            totalPayout.push(Number(initialPrincipal) - Number(installment) * i);
            totalFee.push(Number(this.executorAllowance) * i);
            break;
          }
          

        }

        const utxoId = `${utxo.txid}:${utxo.vout.toString()}`;
        series.push({
          id: utxoId,
          data: {
            time: time,
            principal: principal,
            payout: totalPayout,
            executorAllowance: totalFee,
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
      throw Error("No funds on contract"); 
    }

    const fn = this.getFunction(Annuity.fn)!;

    if (balance < this.installment)
      throw Error("Funds selected below installment amount");

    const newPrincipal = balance - (BigInt(this.installment) + BigInt(this.executorAllowance));

    const to = [
      {
        to: this.recipientAddress,
        amount: BigInt(this.installment),
      }
    ];

    if (this.options.version == 1 || balance > BigInt(this.installment) * 2n) {
      to.push(
        {
          to: this.getAddress(),
          amount: newPrincipal,
        }
      )
    }


    let estimator = fn();
    let tx = fn();

    if (utxos) tx = tx.from(utxos);
    if (utxos) estimator = estimator.from(utxos);

    if (exAddress)
      to.push({
        to: exAddress,
        amount: 577n,
      });

    const size = await estimator!
      .to(to)
      .withAge(Number(this.period))
      .withoutChange()
      .build();

    const minerFee = fee ? BigInt(fee) : BigInt(size.length) / 2n + 2n;
    const executorFee =
      balance - (BigInt(this.installment) + BigInt(newPrincipal) + minerFee) - 4n;

    if (exAddress) {
      to.pop();
      if (executorFee < 577n)
        throw Error(
          `inputs would result in executor fee below dust limit ${executorFee}`
        );
      to.push({
        to: exAddress,
        amount: executorFee,
      });
    }

    tx!.to(to).withAge(Number(this.period)).withoutChange();


    let txn = ""
    if (debug) {
      txn = await tx.bitauthUri()
    } else {
      txn = (await tx.send()).txid;
    }
    return txn;

  }
}
