import {
  hexToBin,
  cashAddressToLockingBytecode,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import type { Artifact, Utxo } from "cashscript";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import {
  getPrefixFromNetwork,
  deriveLockingBytecodeHex,
  binToNumber,
  toHex,
} from "../../common/util.js";
import { artifact as v1 } from "./cash/v1.js";

export class Annuity extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "A"; //A
  private static fn: string = "execute";

  public recipientLockingBytecode: any;

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
    let minerFee = fee ? fee : 1000;
    let executorFee =
      balance - (this.installment + newPrincipal + minerFee) - 2;

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

    if (typeof exAddress === "string")
      to.push({
        to: exAddress,
        amount: executorFee,
      });

    let estimator = fn();
    let tx = fn();
    if (utxos) tx = tx.from(utxos);
    if (utxos) estimator = estimator.from(utxos);

    let size = await estimator!
      .to(to)
      .withAge(this.period)
      .withoutChange()
      .build();

    minerFee = fee ? fee : size.length / 2 + 2;
    executorFee = balance - (this.installment + newPrincipal + minerFee);

    if (exAddress) {
      to.pop();
      to.push({
        to: exAddress,
        amount: executorFee,
      });
    }

    let payTx = await tx!.to(to).withAge(this.period).withoutChange().send();
    return payTx.txid;
  }
}
