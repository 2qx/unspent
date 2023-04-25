import type { Artifact, Utxo, NetworkProvider } from "cashscript";
import type { ContractOptions } from "../../common/interface.js";
import { binToBigInt, decodeNullDataScript } from "../../common/util.js";
import { DefaultOptions, DUST_UTXO_THRESHOLD } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import { artifact as v1 } from "./cash/v1.js";
import { hash160, sum, toHex, parseBigInt } from "../../common/util.js";
import { binToHex, hexToBin } from "@bitauth/libauth";

export class Record extends BaseUtxPhiContract {
  static c: string = "R";
  private static fn: string = "execute";
  public static minMaxFee: bigint = 310n;

  constructor(
    public maxFee: bigint|number = 850n,
    public index: bigint|number = 0n,
    public options: ContractOptions = DefaultOptions
  ) {
    let script: Artifact;
    if (options.version === 1) {
      script = v1;
    } else {
      throw Error("Unrecognized Divide Contract Version");
    }
    if (maxFee < Record.minMaxFee)
      throw Error(
        `Allowed fee < ${Record.minMaxFee} may result in unusable outputs`
      );

    super(options.network!, script, [BigInt(maxFee), BigInt(index)]);
    this.options = options;
  }

  static fromString(str: string, network = "mainnet"): Record {
    const p = this.parseSerializedString(str, network);
    // if the contract shortcode doesn't match, error
    if (!(this.c == p.code))
      throw `non-${this.name} serialized string passed to ${this.name} constructor`;

    if (p.options.version != 1)
      throw Error(`${this.name} contract version not recognized`);

    const maxFee = parseBigInt(p.args.shift()!);
    const index = parseBigInt(p.args.shift()!);
    const record = new Record(maxFee, index, p.options);

    // check that the address
    record.checkLockingBytecode(p.lockingBytecode);
    return record;
  }

  static async getSpendableBalance(
    opReturn: Uint8Array | string,
    network = "mainnet",
    networkProvider: NetworkProvider,
    blockHeight: number
  ): Promise<bigint> {
    const p = this.parseOpReturn(opReturn, network);
    blockHeight;
    const utxos = await networkProvider.getUtxos(p.address);
    const spendableUtxos = utxos.map((u) => {
      return u.satoshis;
    });
    const spendable = spendableUtxos.length > 0 ? spendableUtxos.reduce(sum) : 0n;
    if (spendable > DUST_UTXO_THRESHOLD) {
      return spendable;
    } else {
      return 0n;
    }
  }

  static getExecutorAllowance(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): bigint {
    opReturn;
    network;
    return 0n;
  }

  override toString() {
    return [
      `${Record.c}`,
      `${this.options!.version}`,
      `${this.maxFee}`,
      `${this.index}`,
      `${this.getLockingBytecode()}`,
    ].join(Record.delimiter);
  }

  override asText(): string {
    return `Recording contract with up to ${this.maxFee} per broadcast, index ${this.index}`;
  }

  toOpReturn(hex = false): string | Uint8Array {
    const chunks = [
      Record._PROTOCOL_ID,
      Record.c,
      toHex(this.options!.version!),
      toHex(this.maxFee),
      toHex(this.index),
      "0x" + this.getLockingBytecode(true),
    ];
    return this.asOpReturn(chunks, hex);
  }

  // Create a Record contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Record {
    const p = this.parseOpReturn(opReturn, network);

    // check code
    if (p.code !== this.c)
      throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

    // version
    if (p.options.version !== 1)
      throw Error(
        `Wrong version code passed to ${this.name} class: ${p.options.version}`
      );

    let [maxFee, index]: [bigint?, bigint?] = [undefined, undefined];
    if (p.options.version == 1) {
      maxFee = binToBigInt(p.args.shift()!);
      index = binToBigInt(p.args.shift()!);
    } else {
      throw Error("Record contract version not recognized");
    }

    const record = new Record(maxFee, index, p.options);

    // check that the address
    record.checkLockingBytecode(p.lockingBytecode);
    return record;
  }

  getOutputLockingBytecodes(hex = true) {
    hex;
    return [];
  }

  async broadcast(
    opReturn?: Uint8Array | string,
    utxos?: Utxo[]
  ): Promise<string> {
    // Don't attempt to broadcast from an unfunded contract
    if (!(await this.isFunded()))
      throw Error(`Record contract is not funded: ${this.getAddress()}`);

    opReturn = opReturn ? opReturn : this.toOpReturn(false);

    // .withOpReturn likes hex to be prefixed with 0x.
    const chunks = decodeNullDataScript(opReturn).map(
      (c) => "0x" + binToHex(c)
    );

    // regardless of how many inputs, filter to two if more than two utxos are available
    if (!utxos || utxos.length == 0) {
      const allUtxos = await this.getUtxos();
      if (allUtxos && allUtxos.length > 1) {
        utxos = allUtxos.slice(0, 2);
      }
    }

    if (typeof opReturn === "string") opReturn = hexToBin(opReturn);
    const checkHash = await hash160(opReturn);

    const fn = this.getFunction(Record.fn)!;

    let tx = fn(checkHash)!;
    let estimator = fn(checkHash)!;

    if (utxos && utxos.length > 1) {
      tx = tx.from(utxos);
      estimator = estimator.from(utxos);
    }

    const size = BigInt((
      await estimator.withOpReturn(chunks).withHardcodedFee(669n).build()
    ).length);

    const txn = await tx
      .withOpReturn(chunks)
      .withHardcodedFee(size / 2n)
      .send();
    return txn.txid;
  }
}
