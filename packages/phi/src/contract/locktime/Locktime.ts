import {
  binToHex,
  cashAddressToLockingBytecode,
  hexToBin,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import type { Artifact, Utxo } from "cashscript";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions, _PROTOCOL_ID, DUST_UTXO_THRESHOLD, SPECIALS } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import {
  binToBigInt,
  deriveLockingBytecodeHex,
  getPrefixFromNetwork,
  parseBigInt,
  toHex,
} from "../../common/util.js";
import { artifact as v2 } from "./cash/v2.js";

export class Locktime extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "T";
  private static fn: string = "execute";
  public recipientLockingBytecode: Uint8Array;
  public static minAllowance: bigint = DUST_UTXO_THRESHOLD + 220n + 10n;

  constructor(
    public period: bigint = 144n,
    public address: string,
    public executorAllowance: bigint,
    public options: ContractOptions = DefaultOptions
  ) {
    let script: Artifact;
    if (options.version === 2) {
      script = v2;
    } else {
      throw Error("Unrecognized Locktime Version");
    }
    let lock = cashAddressToLockingBytecode(address);
    if (typeof lock === "string") throw lock;
    let bytecode = lock.bytecode;

    if (executorAllowance < Locktime.minAllowance) throw Error(`Executor Allowance below usable threshold ${Locktime.minAllowance}`)

    super(options.network!, script, [
      period,
      bytecode,
      executorAllowance
    ]);
    this.recipientLockingBytecode = lock.bytecode;
    this.options = options;
  }

  static fromString(str: string, network = "mainnet"): Locktime {
    let p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(this.c == p.code))
      throw `non-${this.name} serialized string passed to ${this.name} constructor`;

    if (p.options.version != 2)
      throw Error(`${this.name} contract version not recognized`);
    if (p.args.length != 3)
      throw `invalid number of arguments ${p.args.length}`;

    const period = parseBigInt(p.args.shift()!);

    const lock = p.args.shift()!;

    const prefix = getPrefixFromNetwork(network);
    const address = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    const executorAllowance = parseBigInt(p.args.shift()!);

    let locktime = new Locktime(
      period,
      address,
      executorAllowance,
      p.options
    );

    // check that the address
    locktime.checkLockingBytecode(p.lockingBytecode);
    return locktime;
  }

  // Create a Locktime contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Locktime {
    let p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (p.options.version !== 1)
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    let period = binToBigInt(p.args.shift()!);
    let lock = p.args.shift()!;

    let prefix = getPrefixFromNetwork(network);
    let address = lockingBytecodeToCashAddress(lock, prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    const executorAllowance = binToBigInt(p.args.shift()!);

    let locktime = new Locktime(
      period,
      address,
      executorAllowance,
      p.options
    );

    // check that the address
    locktime.checkLockingBytecode(p.lockingBytecode);
    return locktime;
  }

  override toString() {
    return [
      `${Locktime.c}`,
      `${this.options!.version}`,
      `${this.period}`,
      `${deriveLockingBytecodeHex(this.address)}`,
      `${this.executorAllowance}`,
      `${this.getLockingBytecode()}`,
    ].join(Locktime.delimiter);
  }

  override asText(): string {
    return `Locktime with a period of ${this.period} (sat), after a ${this.executorAllowance} (sat) executor allowance`;
  }

  toOpReturn(hex = false): string | Uint8Array {
    const chunks = [
      Locktime._PROTOCOL_ID,
      Locktime.c,
      toHex(this.options!.version!),
      toHex(this.period),
      "0x" + deriveLockingBytecodeHex(this.address),
      toHex(this.executorAllowance),
      "0x" + this.getLockingBytecode(),
    ];
    return this.asOpReturn(chunks, hex);
  }

  getOutputLockingBytecodes(hex = true) {
    if (hex) {
      return [binToHex(this.recipientLockingBytecode)]
    } else {
      return [this.recipientLockingBytecode]
    }
  }

  isSpecial(): boolean {
    let out = this.getOutputLockingBytecodes(true).pop()! as string;
    return SPECIALS.includes(out)
  }

  async execute(
    exAddress?: string,
    fee?: bigint,
    utxos?: Utxo[]
  ): Promise<string> {
    let currentValue = 0n;
    if (utxos && utxos?.length > 0) {
      currentValue = utxos.reduce((a, b) => a + b.satoshis, 0n);
    } else {
      currentValue = await this.getBalance();
    }
    if (currentValue == 0n) return "No funds on contract";

    let fn = this.getFunction(Locktime.fn)!;
    let principal = currentValue - (this.executorAllowance);


    let to = [
      {
        to: this.address,
        amount: principal,
      },
    ];

    let executorFee = DUST_UTXO_THRESHOLD;
    if (typeof exAddress === "string" && exAddress)
      to.push({
        to: exAddress,
        amount: executorFee,
      });

    let tx = fn();
    if (utxos) tx = tx.from(utxos);

    let size = await tx!.to(to).withAge(Number(this.period)).withoutChange().build();

    //console.log(size.length / 2)
    if (exAddress) {
      let minerFee = fee ? fee : BigInt(size.length) / 2n;

      executorFee = this.executorAllowance - minerFee - 7n
      to.pop();
      to.push({
        to: exAddress,
        amount: executorFee,
      });
    }

    tx = fn();
    if (utxos) tx = tx.from(utxos);
    let payTx = await tx!.to(to).withAge(Number(this.period)).withoutChange().send();
    return payTx.txid;

  }
}
