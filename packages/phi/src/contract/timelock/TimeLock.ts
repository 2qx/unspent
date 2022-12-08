import {
  binToHex,
  cashAddressToLockingBytecode,
  hexToBin,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import type { Artifact, Utxo } from "cashscript";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions, _PROTOCOL_ID, DUST_UTXO_THRESHOLD } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import {
  binToNumber,
  deriveLockingBytecodeHex,
  getPrefixFromNetwork,
  toHex,
} from "../../common/util.js";
import { artifact as v1 } from "./cash/v1.js";

export class TimeLock extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "T";
  private static fn: string = "execute";
  public recipientLockingBytecode: Uint8Array;
  public static minAllowance: number = DUST_UTXO_THRESHOLD + 220 + 10;

  constructor(
    public period: number = 144,
    public address: string,
    public executorAllowance: number,
    public options: ContractOptions = DefaultOptions
  ) {
    let script: Artifact;
    if (options.version === 1) {
      script = v1;
    } else {
      throw Error("Unrecognized TimeLock Version");
    }
    let lock = cashAddressToLockingBytecode(address);
    if (typeof lock === "string") throw lock;
    let bytecode = lock.bytecode;

    if (executorAllowance < TimeLock.minAllowance) throw Error(`Executor Allowance below usable threshold ${TimeLock.minAllowance}`)

    super(options.network!, script, [
      period,
      bytecode,
      executorAllowance
    ]);
    this.recipientLockingBytecode = lock.bytecode;
    this.options = options;
  }

  static fromString(str: string, network = "mainnet"): TimeLock {
    let p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(this.c == p.code))
      throw `non-${this.name} serialized string passed to ${this.name} constructor`;

    if (p.options.version != 1)
      throw Error(`${this.name} contract version not recognized`);
    if (p.args.length != 3)
      throw `invalid number of arguments ${p.args.length}`;

    const period = parseInt(p.args.shift()!);

    const lock = p.args.shift()!;

    const prefix = getPrefixFromNetwork(network);
    const address = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    const executorAllowance = parseInt(p.args.shift()!);

    let timeLock = new TimeLock(
      period,
      address,
      executorAllowance,
      p.options
    );

    // check that the address
    timeLock.checkLockingBytecode(p.lockingBytecode);
    return timeLock;
  }

  // Create a TimeLock contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): TimeLock {
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

    const executorAllowance = binToNumber(p.args.shift()!);

    let timeLock = new TimeLock(
      period,
      address,
      executorAllowance,
      p.options
    );

    // check that the address
    timeLock.checkLockingBytecode(p.lockingBytecode);
    return timeLock;
  }

  override toString() {
    return [
      `${TimeLock.c}`,
      `${this.options!.version}`,
      `${this.period}`,
      `${deriveLockingBytecodeHex(this.address)}`,
      `${this.executorAllowance}`,
      `${this.getLockingBytecode()}`,
    ].join(TimeLock.delimiter);
  }

  override asText(): string {
    return `TimeLock with a period of ${this.period} (sat), after a ${this.executorAllowance} (sat) executor allowance`;
  }

  toOpReturn(hex = false): string | Uint8Array {
    const chunks = [
      TimeLock._PROTOCOL_ID,
      TimeLock.c,
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

  async execute(
    exAddress?: string,
    fee?: number,
    utxos?: Utxo[]
  ): Promise<string> {
    let currentValue = 0;
    if (utxos && utxos?.length > 0) {
      currentValue = utxos.reduce((a, b) => a + b.satoshis, 0);
    } else {
      currentValue = await this.getBalance();
    }
    if (currentValue == 0) return "No funds on contract";

    let fn = this.getFunction(TimeLock.fn)!;
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

    let size = await tx!.to(to).withAge(this.period).withoutChange().build();

    //console.log(size.length / 2)
    if (exAddress) {
      let minerFee = fee ? fee : size.length / 2;

      executorFee = this.executorAllowance - minerFee - 7
      to.pop();
      to.push({
        to: exAddress,
        amount: executorFee,
      });
    }

    tx = fn();
    if (utxos) tx = tx.from(utxos);
    let payTx = await tx!.to(to).withAge(this.period).withoutChange().send();
    return payTx.txid;

  }
}
