import type { Artifact, Utxo, NetworkProvider } from "cashscript";
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
  parseBigInt,
  toHex,
  sum,
  binToBigInt,
} from "../../common/util.js";
import { artifact as v1_2 } from "./cash/divide.2.js";
import { artifact as v1_3 } from "./cash/divide.3.js";
import { artifact as v1_4 } from "./cash/divide.4.js";

const scriptMapV1: Artifact[] = [v1_2, v1_3, v1_4];

export class Divide extends BaseUtxPhiContract implements UtxPhiIface {
  private static c: string = "D";
  private static fn: string = "execute";
  private payeeLocks: Uint8Array[];
  public divisor: bigint;
  public static minAllowance = 227n + DUST_UTXO_THRESHOLD + 10n;

  constructor(
    public executorAllowance: bigint|number = 1200n,
    public payees: string[],
    public options: ContractOptions = DefaultOptions
  ) {
    let scriptFn;
    if (options.version === 1) {
      scriptFn = scriptMapV1;
    } else {
      throw Error("Unrecognized Divide Contract Version");
    }

    const usableThreshold = Divide.minAllowance + 66n * BigInt(payees.length);
    if (executorAllowance < usableThreshold)
      throw Error(
        `Executor Allowance below usable threshold (${usableThreshold}) for ${payees.length} addresses`
      );

    const divisor = BigInt(payees.length);
    if (!(divisor >= 2n && divisor <= 4n))
      throw Error(`Divide contract range must be 2-4, ${divisor} out of range`);
    const script = scriptFn[Number(divisor - 2n)]!;

    const payeeLocks = [...payees].map((c) => {
      const lock = cashAddressToLockingBytecode(c);
      if (typeof lock === "string") throw lock;
      return lock.bytecode;
    });
    super(options.network!, script, [
      BigInt(executorAllowance),
      divisor,
      ...payeeLocks,
    ]);
    this.payeeLocks = payeeLocks;
    this.divisor = divisor;
    this.options = options;
  }

  refresh(): void {
    this.payeeLocks = [...this.payees].map((c) => {
      const lock = cashAddressToLockingBytecode(c);
      if (typeof lock === "string") throw lock;
      return lock.bytecode;
    });

    this._refresh([BigInt(this.executorAllowance), this.divisor, ...this.payeeLocks]);
  }

  static fromString(str: string, network = "mainnet"): Divide {
    const p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(Divide.c == p.code))
      throw "non-faucet serialized string passed to faucet constructor";

    if (p.options.version != 1)
      throw Error(`${this.name} contract version not recognized`);

    const prefix = getPrefixFromNetwork(p.options.network);

    const executorAllowance = parseBigInt(p.args.shift()!);
    const payees = p.args.map((lock) => {
      const addr = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
      if (typeof addr !== "string") throw Error("non-standard address" + addr);
      return addr;
    });

    const divide = new Divide(executorAllowance, payees, p.options);

    // check that the address
    divide.checkLockingBytecode(p.lockingBytecode);
    return divide;
  }

  // Create a Divide contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Divide {
    const p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (p.options.version !== 1)
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    const prefix = getPrefixFromNetwork(p.options.network);

    const executorAllowance = binToBigInt(p.args.shift()!);
    const payeesLocks = p.args;
    const payees = payeesLocks.map((lock) => {
      const addr = lockingBytecodeToCashAddress(lock, prefix);
      if (typeof addr !== "string")
        throw Error("non-standard address: " + addr);
      return addr;
    });
    const divide = new Divide(executorAllowance, payees, p.options);

    // check that the address
    divide.checkLockingBytecode(p.lockingBytecode);
    return divide;
  }

  static getExecutorAllowance(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): bigint {
    const p = this.parseOpReturn(opReturn, network);
    return binToBigInt(p.args.shift()!);
  }

  static async getSpendableBalance(
    opReturn: Uint8Array | string,
    network = "mainnet",
    networkProvider: NetworkProvider,
    blockHeight: number
  ): Promise<bigint> {
    const p = this.parseOpReturn(opReturn, network);
    blockHeight;
    const executorAllowance = binToBigInt(p.args.shift()!);
    const utxos = await networkProvider.getUtxos(p.address);
    const spendableUtxos = utxos.map((u) => {
      return u.satoshis;
    });
    const spendable = spendableUtxos.length > 0 ? spendableUtxos.reduce(sum) : 0n;
    if (spendable > BigInt(p.args.length) * DUST_UTXO_THRESHOLD + executorAllowance) {
      return spendable;
    } else {
      return 0n;
    }
  }

  override toString() {
    const payees = this.payees
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
    const chunks = [
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
    fee?: bigint,
    utxos?: Utxo[]
  ): Promise<string> {
    let balance = 0n;
    if (utxos && utxos?.length > 0) {
      balance = utxos.reduce((a, b) => a + b.satoshis, 0n);
    } else {
      balance = await this.getBalance();
    }
    if (balance == 0n) return "No funds on contract";

    const fn = this.getFunction(Divide.fn)!;
    const distributedValue = balance - BigInt(this.executorAllowance);
    const divisor = BigInt(this.payees.length);
    const installment =distributedValue / divisor + 1n;

    if (installment < 546n) throw "Installment less than dust limit... bailing";

    const to: any[] = [];
    for (let i = 0; i < divisor; i++) {
      to.push({ to: this.payees[i], amount: installment });
    }

    if (exAddress) {
      to.push({
        to: exAddress,
        amount: 546n,
      });

      const size = await fn().to(to).withoutChange().build();

      const feeEstimate = fee ? fee : BigInt(size.length) / 2n;

      to.pop();
      const executorPayout =
        BigInt(this.executorAllowance) - (feeEstimate + 2n * divisor + 8n);
      if (executorPayout > 546n)
        to.push({
          to: exAddress,
          amount: executorPayout,
        });
    }

    const txn = await fn().to(to).withoutChange().send();

    return txn.txid;
  }
}
