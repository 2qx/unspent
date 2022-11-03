import type { Artifact, Utxo } from "cashscript";
import {
  cashAddressToLockingBytecode,
  hexToBin,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import {
  deriveLockingBytecodeHex,
  getPrefixFromNetwork,
  toHex,
  binToNumber,
} from "../../common/util.js";
import { artifact as v1_2 } from "./cash/divide.2.js";
import { artifact as v1_3 } from "./cash/divide.3.js";
import { artifact as v1_4 } from "./cash/divide.4.js";

const scriptMapV1: Artifact[] = [v1_2, v1_3, v1_4];

export class Divide extends BaseUtxPhiContract implements UtxPhiIface {
  private static c: string = "D";
  private static fn: string = "execute";
  private payeeLocks: Uint8Array[];
  public divisor: number;

  constructor(
    public executorAllowance: number = 1200,
    public payees: string[],
    public options: ContractOptions = DefaultOptions
  ) {
    let scriptFn;
    if (options.version === 1) {
      scriptFn = scriptMapV1;
    } else {
      throw Error("Unrecognized Divide Contract Version");
    }
    let divisor = payees.length;
    if (!(divisor >= 2 && divisor <= 4))
      throw Error(`Divide contract range must be 2-4, ${divisor} out of range`);
    const script = scriptFn[divisor - 2]!;

    let payeeLocks = [...payees].map((c) => {
      let lock = cashAddressToLockingBytecode(c);
      if (typeof lock === "string") throw lock;
      return lock.bytecode;
    });
    super(options.network!, script, [
      executorAllowance,
      divisor,
      ...payeeLocks,
    ]);
    this.payeeLocks = payeeLocks;
    this.divisor = divisor;
    this.options = options;
  }

  refresh(): void {
    this.payeeLocks = [...this.payees].map((c) => {
      let lock = cashAddressToLockingBytecode(c);
      if (typeof lock === "string") throw lock;
      return lock.bytecode;
    });

    this._refresh([this.executorAllowance, this.divisor, ...this.payeeLocks]);
  }

  static fromString(str: string, network = "mainnet"): Divide {
    let p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(Divide.c == p.code))
      throw "non-faucet serialized string passed to faucet constructor";

    if (p.options.version != 1)
      throw Error(`${this.name} contract version not recognized`);

    let prefix = getPrefixFromNetwork(p.options.network);

    let executorAllowance = parseInt(p.args.shift()!);
    let payees = p.args.map((lock) => {
      let addr = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
      if (typeof addr !== "string") throw Error("non-standard address" + addr);
      return addr;
    });

    let divide = new Divide(executorAllowance, payees, p.options);

    // check that the address
    divide.checkLockingBytecode(p.lockingBytecode);
    return divide;
  }

  // Create a Divide contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Divide {
    let p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (p.options.version !== 1)
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    let prefix = getPrefixFromNetwork(p.options.network);

    let executorAllowance = binToNumber(p.args.shift()!);
    let payeesLocks = p.args;
    let payees = payeesLocks.map((lock) => {
      let addr = lockingBytecodeToCashAddress(lock, prefix);
      if (typeof addr !== "string")
        throw Error("non-standard address: " + addr);
      return addr;
    });
    let divide = new Divide(executorAllowance, payees, p.options);

    // check that the address
    divide.checkLockingBytecode(p.lockingBytecode);
    return divide;
  }

  override toString() {
    let payees = this.payees
      .map((cashaddr) => deriveLockingBytecodeHex(cashaddr))
      .join(Divide.delimiter);
    return [
      `${Divide.c}`,
      `${this.options!.version}`,
      `${this.executorAllowance}`,
      `${payees}`,
      `${this.getLockingBytecode()}`,
    ].join(Divide.delimiter);
  }

  override asText() {
    return `A divide contract with executor allowance of ${this.executorAllowance}`;
  }

  toOpReturn(hex = false): string | Uint8Array {
    let chunks = [
      Divide._PROTOCOL_ID,
      Divide.c,
      toHex(this.options!.version!),
      toHex(this.executorAllowance),
      ...this.payees.map((a) => "0x" + deriveLockingBytecodeHex(a)),
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
    if (balance == 0) return "No funds on contract";

    let fn = this.getFunction(Divide.fn)!;
    let distributedValue = balance - this.executorAllowance;
    let divisor = this.payees.length;
    let installment = Math.round(distributedValue / divisor) + 2;

    if (installment < 546) throw "Installment less than dust limit... bailing";

    let to: any[] = [];
    for (let i = 0; i < divisor; i++) {
      to.push({ to: this.payees[i], amount: installment });
    }

    let feeEstimate = fee ? fee : 186 + this.payees.length * 64;

    if (exAddress) {
      to.push({
        to: exAddress,
        amount: this.executorAllowance - feeEstimate,
      });

      let size = await fn().to(to).withoutChange().build();

      let fee = size.length / 2;
      to.pop();
      to.push({
        to: exAddress,
        amount: this.executorAllowance - (fee + 20),
      });
    }

    let txn = fn().to(to).withoutChange().send();
    return (await txn).txid;
  }
}
