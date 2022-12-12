import type { Artifact, Utxo, ElectrumNetworkProvider } from "cashscript";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions, DUST_UTXO_THRESHOLD } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import { binToNumber, sum, toHex } from "../../common/util.js";
import { artifact as v1 } from "./cash/v1.js";

export class Faucet extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "F";
  private static fn: string = "drip";
  public static minPayout: number = 158+DUST_UTXO_THRESHOLD+10;

  constructor(
    public period: number = 1,
    public payout: number = 1000,
    public index: number = 1,
    public options: ContractOptions = DefaultOptions
  ) {
    let script: Artifact;
    if (options.version === 1) {
      script = v1;
    } else {
      throw Error("Unrecognized Faucet Version");
    }

    if(payout<Faucet.minPayout) throw Error("Payout below dust threshold")

    super(options.network!, script, [period, payout, index]);
    this.options = options;
  }

  refresh(): void {
    this._refresh([this.period, this.payout, this.index]);
  }

  static fromString(str: string, network = "mainnet"): Faucet {
    let p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(Faucet.c == p.code))
      throw "non-faucet serialized string passed to faucet constructor";

    if (p.options.version != 1)
      throw Error("faucet contract version not recognized");

    if (p.args.length != 3)
      throw `invalid number of arguments ${p.args.length}`;
    let [period, payout, index] = [...p.args.map((i) => parseInt(i) as number)];

    let faucet = new Faucet(period, payout, index, p.options);
    faucet.checkLockingBytecode(p.lockingBytecode);
    return faucet;
  }

  // Create a Faucet contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Faucet {
    let p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (p.options.version !== 1)
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    // parse argumnets
    if (p.args.length != 3)
      throw `invalid number of arguments ${p.args.length}`;
    let [period, payout, index] = [
      ...p.args.map((i) => binToNumber(i) as number),
    ];

    let faucet = new Faucet(period, payout, index, p.options);
    faucet.checkLockingBytecode(p.lockingBytecode);
    return faucet;
  }


  static async getSpendableBalance(
    opReturn: Uint8Array | string,
    network = "mainnet",
    networkProvider: ElectrumNetworkProvider,
    blockHeight: number
  ): Promise<number> {
    let p = this.parseOpReturn(opReturn, network);
    let period = binToNumber(p.args.shift()!);
    let payout = binToNumber(p.args.shift()!);
    let utxos = await networkProvider.getUtxos(p.address)
    let spendableUtxos = utxos.map((u: Utxo) => {
      // @ts-ignore
      if (u.height !== 0) {
        // @ts-ignore
        if (blockHeight - u.height > period) {
          return u.satoshis
        }
        else {
          return 0
        }
      } else {
        return 0
      }
    })
    const spendable = spendableUtxos.length> 0 ? spendableUtxos.reduce(sum) : 0
    if (spendable > payout) {
      return spendable
    } else {
      return 0
    }
  }

  static getExecutorAllowance(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): number {
    let p = this.parseOpReturn(opReturn, network);
    // pop the index to get to the payout
    p.args.pop()!
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
    let chunks = [
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

  getOutputLockingBytecodes(hex=true){
    hex
    return []
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

    let fn = this.getFunction(Faucet.fn)!;
    let newPrincipal = balance - this.payout;
    let minerFee = fee ? fee : 253;
    let sendAmount = this.payout - minerFee;

    let to = [
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

    let size = await fn().to(to).withAge(this.period).withoutChange().build();
    if (exAddress) {
      let minerFee = fee ? fee : size.length / 2;
      sendAmount = this.payout - (minerFee + 10);
      // remove the old executor amount
      // replace with new fee
      to.pop();
      to.push({
        to: exAddress,
        amount: sendAmount,
      });
    }

    let payTx = await fn().to(to).withAge(this.period).withoutChange().send();
    return payTx.txid;
  }
}
