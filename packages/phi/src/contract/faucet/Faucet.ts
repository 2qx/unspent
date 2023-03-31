import type { Artifact, Utxo, NetworkProvider } from "cashscript";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions, DUST_UTXO_THRESHOLD } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import { binToNumber, sum, toHex } from "../../common/util.js";
import { artifact as v0 } from "./cash/v0.js";
import { artifact as v1 } from "./cash/v1.js";

export class Faucet extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "F";
  private static fn: string = "drip";
  public static minPayout: number = 158 + DUST_UTXO_THRESHOLD + 10;

  constructor(
    public period: number = 1,
    public payout: number = 1000,
    public index: number = 1,
    public options: ContractOptions = DefaultOptions
  ) {
    let script: Artifact;
    if (options.version === 1) {
      script = v1;
    }else if (options.version === 0) {
      script = v0;
    } else {
      throw Error("Unrecognized Faucet Version");
    }

    if (payout < Faucet.minPayout) throw Error("Payout below dust threshold");

    super(options.network!, script, [period, payout, index]);
    this.options = options;
  }

  refresh(): void {
    this._refresh([this.period, this.payout, this.index]);
  }

  static fromString(str: string, network = "mainnet"): Faucet {
    const p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(Faucet.c == p.code))
      throw "non-faucet serialized string passed to faucet constructor";

    if (![0,1].includes(p.options.version))
      throw Error("faucet contract version not recognized");

    if (p.args.length != 3)
      throw `invalid number of arguments ${p.args.length}`;
    const [period, payout, index] = [...p.args.map((i) => parseInt(i) as number)];

    const faucet = new Faucet(period, payout, index, p.options);
    faucet.checkLockingBytecode(p.lockingBytecode);
    return faucet;
  }

  // Create a Faucet contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Faucet {
    const p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (![0,1].includes(p.options.version))
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    // parse argumnets
    if (p.args.length != 3)
      throw `invalid number of arguments ${p.args.length}`;
    const [period, payout, index] = [
      ...p.args.map((i) => binToNumber(i) as number),
    ];

    const faucet = new Faucet(period, payout, index, p.options);
    faucet.checkLockingBytecode(p.lockingBytecode);
    return faucet;
  }

  static async getSpendableBalance(
    opReturn: Uint8Array | string,
    network = "mainnet",
    networkProvider: NetworkProvider,
    blockHeight: number
  ): Promise<number> {
    const p = this.parseOpReturn(opReturn, network);
    const period = binToNumber(p.args.shift()!);
    const payout = binToNumber(p.args.shift()!);
    const utxos = await networkProvider.getUtxos(p.address);
    const spendableUtxos = utxos.map((u: Utxo) => {
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
    const spendable =
      spendableUtxos.length > 0 ? spendableUtxos.reduce(sum) : 0;
    if (spendable > payout) {
      return spendable;
    } else {
      return 0;
    }
  }

  static getExecutorAllowance(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): number {
    const p = this.parseOpReturn(opReturn, network);
    // pop the index to get to the payout
    p.args.pop()!;
    return binToNumber(p.args.pop()!);
  }

  override toString() {
    return [
      `${Faucet.c}`,
      `${this.options!.version}`,
      `${this.period}`,
      `${this.payout}`,
      `${this.index}`,
      `${this.getLockingBytecode()}`,
    ].join(Faucet.delimiter);
  }

  override asText() {
    return `A faucet paying ${this.payout} (sat), every ${this.period} blocks`;
  }

  toOpReturn(hex = false): string | Uint8Array {
    const chunks = [
      Faucet._PROTOCOL_ID,
      Faucet.c,
      toHex(this.options!.version!),
      toHex(this.period),
      toHex(this.payout),
      toHex(this.index),
      "0x" + this.getLockingBytecode(true),
    ];
    return this.asOpReturn(chunks, hex);
  }

  getOutputLockingBytecodes(hex = true) {
    hex;
    return [];
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
    if (balance == 0) return "No funds on contract";

    const fn = this.getFunction(Faucet.fn)!;
    let tx = fn();
    if (utxos) tx = tx.from(utxos);
    const newPrincipal = balance - this.payout;
    const minerFee = fee ? fee : 253;
    let sendAmount = this.payout - minerFee;

    const to = [
      {
        to: this.getAddress(),
        amount: newPrincipal,
      },
    ];

    if (exAddress)
      to.push({
        to: exAddress,
        amount: 546,
      });

    const size = await tx.to(to).withAge(this.period).withoutChange().build();
    if (exAddress) {
      const minerFee = fee ? fee : size.length / 2;
      sendAmount = this.payout - (minerFee + 10);
      // remove the old executor amount
      // replace with new fee
      to.pop();
      to.push({
        to: exAddress,
        amount: sendAmount,
      });
    }
    tx = fn();
    if (utxos) tx = tx.from(utxos);
    const payTx = await tx.to(to).withAge(this.period).withoutChange().send();
    return payTx.txid;
  }
}
