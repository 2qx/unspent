import {
  binToHex,
  hexToBin,
  cashAddressToLockingBytecode,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import type { Artifact, Utxo, ElectrumNetworkProvider } from "cashscript";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions, DUST_UTXO_THRESHOLD } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import { getBlockHeight } from "../../common/network.js";
import {
  getPrefixFromNetwork,
  deriveLockingBytecodeHex,
  binToNumber,
  toHex,
  sum,
} from "../../common/util.js";
import { artifact as v1 } from "./cash/v1.js";

export class Annuity extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "A"; //A
  private static fn: string = "execute";
  public static minAllowance: number = DUST_UTXO_THRESHOLD + 222 + 10;

  public recipientLockingBytecode: Uint8Array;

  constructor(
    public period: number = 4000,
    public recipientAddress: any,
    public installment: number,
    public executorAllowance: number = 800,
    public options: ContractOptions = DefaultOptions
  ) {
    let script: Artifact;
    if (options.version === 1) {
      script = v1;
    } else {
      throw Error("Unrecognized Annuity Version");
    }

    if (installment < DUST_UTXO_THRESHOLD)
      throw Error("Installment below dust threshold");
    if (executorAllowance < Annuity.minAllowance)
      throw Error("Executor Allowance below usable threshold");

    let lock = cashAddressToLockingBytecode(recipientAddress);
    if (typeof lock === "string") throw lock;

    super(options.network!, script, [
      period,
      lock.bytecode,
      installment,
      executorAllowance,
    ]);
    this.recipientLockingBytecode = lock.bytecode;
    this.options = options;
  }

  refresh(): void {
    this._refresh([
      this.period,
      this.recipientLockingBytecode,
      this.installment,
      this.executorAllowance,
    ]);
  }

  static fromString(str: string, network = "mainnet"): Annuity {
    let p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(Annuity.c == p.code))
      throw "non-faucet serialized string passed to faucet constructor";

    if (p.options.version != 1)
      throw Error(`${this.name} contract version not recognized`);
    if (p.args.length != 4)
      throw `invalid number of arguments ${p.args.length}`;

    let period = parseInt(p.args.shift()!);
    let lock = p.args.shift()!;
    let prefix = getPrefixFromNetwork(network);
    let address = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);
    let installment = parseInt(p.args.shift()!);
    let executorAllowance = parseInt(p.args.shift()!);
    let annuity = new Annuity(
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
    let p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (p.options.version !== 1)
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    let period = binToNumber(p.args.shift()!);
    let lock = p.args.shift()!;

    let prefix = getPrefixFromNetwork(network);
    let address = lockingBytecodeToCashAddress(lock, prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    let [installment, executorAllowance] = [30000, 3000];
    if (p.options.version == 1) {
      installment = binToNumber(p.args.shift()!);
      executorAllowance = binToNumber(p.args.shift()!);
    } else {
      throw Error("Annuity contract version not recognized");
    }

    let annuity = new Annuity(
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

  static getExecutorAllowance(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): number {
    let p = this.parseOpReturn(opReturn, network);
    return binToNumber(p.args.pop()!);
  }

  static async getSpendableBalance(
    opReturn: Uint8Array | string,

    // TODO: make multi-network
    network = "mainnet",
    networkProvider: ElectrumNetworkProvider,
    blockHeight: number
  ): Promise<number> {
    let p = this.parseOpReturn(opReturn, network);
    let period = binToNumber(p.args.shift()!);
    // discard the address
    p.args.shift()!;
    let installment = binToNumber(p.args.shift()!);
    let utxos = await networkProvider.getUtxos(p.address);
    let spendableUtxos = utxos.map((u) => {
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
      const spendableBalance = spendableUtxos.reduce(sum);
      const remainder = spendableBalance % installment;
      const spendable = spendableBalance - remainder;
      return spendable > 0 ? spendable : 0;
    } else {
      return 0;
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

  toOpReturn(hex = false): string | Uint8Array {
    let chunks = [
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

  async asSeries(): Promise<any> {
    const currentHeight = await getBlockHeight();
    let currentTime = Math.floor(Date.now() / 1000);
    let utxos = await this.getUtxos();
    let series: any = [];
    // @ts-ignore
    if (!utxos || utxos?.length == 0)
      utxos = [
        {
          satoshis: 1000000,
          txid: "<example 10,000,000 (0.1 BCH) unspent output>",
          vout: 0,
          height: 0,
        },
      ];
    if (utxos) {
      for (const utxo of utxos) {
        let blocksToWait = NaN;
        // @ts-ignore
        if (utxo.height == 0) {
          blocksToWait = this.period;
        } else {
          // @ts-ignore
          blocksToWait = this.period - (currentHeight - utxo.height);
        }
        const seriesStartTime = currentTime + blocksToWait * 600;

        const initialPrincipal = utxo.satoshis;
        let seriesLength =
          (initialPrincipal - DUST_UTXO_THRESHOLD) /
          (this.installment + this.executorAllowance);

        const principal = [];
        const time = [];
        const totalFee = [];
        const totalPayout = [];
        const installment = this.installment + this.executorAllowance;
        const intervalSeconds = this.period * 600;
        for (var i = 0; i < seriesLength; i++) {
          time.push(seriesStartTime + i * intervalSeconds);
          principal.push(initialPrincipal - installment * i);
          totalPayout.push(this.installment * i);
          totalFee.push(this.executorAllowance * i);
        }

        let utxoId = `${utxo.txid}:${utxo.vout.toString()}`;
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
    fee?: number,
    utxos?: Utxo[]
  ): Promise<string> {
    let balance = 0;
    if (utxos && utxos?.length > 0) {
      balance = utxos.reduce((a, b) => a + b.satoshis, 0);
    } else {
      balance = await this.getBalance();
    }
    if (balance == 0) throw Error("No funds on contract");

    let fn = this.getFunction(Annuity.fn)!;

    if (balance < this.installment)
      throw Error("Funds selected below installment amount");

    let newPrincipal = balance - (this.installment + this.executorAllowance);

    let to = [
      {
        to: this.recipientAddress,
        amount: this.installment,
      },
      {
        to: this.getAddress(),
        amount: newPrincipal,
      },
    ];

    let estimator = fn();
    let tx = fn();
    if (utxos) tx = tx.from(utxos);
    if (utxos) estimator = estimator.from(utxos);

    if (exAddress)
      to.push({
        to: exAddress,
        amount: 546,
      });

    let size = await estimator!
      .to(to)
      .withAge(this.period)
      .withoutChange()
      .build();

    let minerFee = fee ? fee : size.length / 2 + 5;
    let executorFee =
      balance - (this.installment + newPrincipal + minerFee) - 4;

    if (exAddress) {
      to.pop();
      if (executorFee < 546)
        throw Error(
          `inputs would result in executor fee below dust limit ${executorFee}`
        );
      to.push({
        to: exAddress,
        amount: executorFee,
      });
    }

    let payTx = await tx!.to(to).withAge(this.period).withoutChange().send();
    return payTx.txid;
  }
}
