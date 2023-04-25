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
  binToBigInt,
  deriveLockingBytecodeHex,
  getPrefixFromNetwork,
  parseBigInt,
  toHex,
} from "../../common/util.js";
import { artifact as v1 } from "./cash/v1.js";

export class Gate extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "G";
  private static fn: string = "execute";
  public recipientLockingBytecode: Uint8Array;
  public static minAllowance: bigint = DUST_UTXO_THRESHOLD + 220n + 10n;

  constructor(
    public threshold: bigint = 100000n,
    public address: string,
    public executorAllowance: bigint,
    public options: ContractOptions = DefaultOptions
  ) {
    let script: Artifact;
    if (options.version === 1) {
      script = v1;
    } else {
      throw Error("Unrecognized Gate Version");
    }
    let lock = cashAddressToLockingBytecode(address);
    if (typeof lock === "string") throw lock;
    let bytecode = lock.bytecode;

    if (executorAllowance < Gate.minAllowance) throw Error(`Executor Allowance below usable threshold ${Gate.minAllowance}`)

    super(options.network!, script, [
      threshold,
      bytecode,
      executorAllowance
    ]);
    this.recipientLockingBytecode = lock.bytecode;
    this.options = options;
  }

  static fromString(str: string, network = "mainnet"): Gate {
    let p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(this.c == p.code))
      throw `non-${this.name} serialized string passed to ${this.name} constructor`;

    if (p.options.version != 1)
      throw Error(`${this.name} contract version not recognized`);
    if (p.args.length != 3)
      throw `invalid number of arguments ${p.args.length}`;

    const threshold = parseBigInt(p.args.shift()!);

    const lock = p.args.shift()!;

    const prefix = getPrefixFromNetwork(network);
    const address = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    const executorAllowance = parseBigInt(p.args.shift()!);

    let gate = new Gate(
      threshold,
      address,
      executorAllowance,
      p.options
    );

    // check that the address
    gate.checkLockingBytecode(p.lockingBytecode);
    return gate;
  }

  // Create a Gate contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Gate {
    let p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (p.options.version !== 1)
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    let threshold = binToBigInt(p.args.shift()!);
    let lock = p.args.shift()!;

    let prefix = getPrefixFromNetwork(network);
    let address = lockingBytecodeToCashAddress(lock, prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    const executorAllowance = binToBigInt(p.args.shift()!);

    let perpetuity = new Gate(
      threshold,
      address,
      executorAllowance,
      p.options
    );

    // check that the address
    perpetuity.checkLockingBytecode(p.lockingBytecode);
    return perpetuity;
  }

  override toString() {
    return [
      `${Gate.c}`,
      `${this.options!.version}`,
      `${this.threshold}`,
      `${deriveLockingBytecodeHex(this.address)}`,
      `${this.executorAllowance}`,
      `${this.getLockingBytecode()}`,
    ].join(Gate.delimiter);
  }

  override asText(): string {
    return `Gate (dust) with a threshold of ${this.threshold} (sat), after a ${this.executorAllowance} (sat) executor allowance`;
  }

  toOpReturn(hex = false): string | Uint8Array {
    const chunks = [
      Gate._PROTOCOL_ID,
      Gate.c,
      toHex(this.options!.version!),
      toHex(this.threshold),
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

    let fn = this.getFunction(Gate.fn)!;
    let newPrincipal = currentValue - (this.executorAllowance);

    // round up
    newPrincipal += 3n;

    let to = [
      {
        to: this.getAddress(),
        amount: newPrincipal,
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

    let size = await tx!.to(to).withoutChange().build();

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
    let payTx = await tx!.to(to).withoutChange().send();
    return payTx.txid;

  }
}
