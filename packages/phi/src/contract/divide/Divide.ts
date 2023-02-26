import type { Artifact, Utxo, ElectrumNetworkProvider } from "cashscript";
import {
  binToHex,
  cashAddressToLockingBytecode,
  hexToBin,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions, DUST_UTXO_THRESHOLD } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import {
  deriveLockingBytecodeHex,
  getPrefixFromNetwork,
  toHex,
  binToNumber,
  sum,
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
  public static minAllowance = 227 + DUST_UTXO_THRESHOLD + 10;

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

    const usableThreshold = Divide.minAllowance + 66 * payees.length;
    if (executorAllowance < usableThreshold)
      throw Error(
        `Executor Allowance below usable threshold (${usableThreshold}) for ${payees.length} addresses`
      );

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

  static getExecutorAllowance(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): number {
    let p = this.parseOpReturn(opReturn, network);
    return binToNumber(p.args.shift()!);
  }

  static async getSpendableBalance(
    opReturn: Uint8Array | string,
    network = "mainnet",
    networkProvider: ElectrumNetworkProvider,
    blockHeight: number
  ): Promise<number> {
    let p = this.parseOpReturn(opReturn, network);
    blockHeight;
    let executorAllowance = binToNumber(p.args.shift()!);
    let utxos = await networkProvider.getUtxos(p.address);
    let spendableUtxos = utxos.map((u) => {
      return u.satoshis;
    });
    let spendable = spendableUtxos.length > 0 ? spendableUtxos.reduce(sum) : 0;
    if (spendable > p.args.length * DUST_UTXO_THRESHOLD + executorAllowance) {
      return spendable;
    } else {
      return 0;
    }
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

  getOutputLockingBytecodes(hex = true) {
    if (hex) {
      return this.payeeLocks.map((b) => binToHex(b));
    } else {
      return this.payeeLocks;
    }
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
    let installment = Math.round(distributedValue / divisor) + 1;

    if (installment < 546) throw "Installment less than dust limit... bailing";

    let to: any[] = [];
    for (let i = 0; i < divisor; i++) {
      to.push({ to: this.payees[i], amount: installment });
    }

    if (exAddress) {
      to.push({
        to: exAddress,
        amount: 546,
      });

      let size = await fn().to(to).withoutChange().build();

      let feeEstimate = fee ? fee : size.length / 2;

      to.pop();
      let executorPayout =
        this.executorAllowance - (feeEstimate + 2 * divisor + 8);
      if (executorPayout > 546)
        to.push({
          to: exAddress,
          amount: executorPayout,
        });
    }

    let txn = await fn().to(to).withoutChange().send();

    return txn.txid;
  }
}
