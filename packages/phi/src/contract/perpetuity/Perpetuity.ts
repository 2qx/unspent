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
import { getBlockHeight } from "../../common/network.js";

export class Perpetuity extends BaseUtxPhiContract implements UtxPhiIface {
  public static c: string = "P";
  private static fn: string = "execute";
  public recipientLockingBytecode: Uint8Array;
  public static minAllowance: number = DUST_UTXO_THRESHOLD + 220 + 10;

  constructor(
    public period: number = 4000,
    public address: string,
    public executorAllowance: number,
    public decay: number,
    public options: ContractOptions = DefaultOptions
  ) {
    let script: Artifact;
    if (options.version === 1) {
      script = v1;
    } else {
      throw Error("Unrecognized Perpetuity Version");
    }
    let lock = cashAddressToLockingBytecode(address);
    if (typeof lock === "string") throw lock;
    let bytecode = lock.bytecode;

    if (executorAllowance < Perpetuity.minAllowance) throw Error(`Executor Allowance below usable threshold ${Perpetuity.minAllowance}`)

    super(options.network!, script, [
      period,
      bytecode,
      executorAllowance,
      decay,
    ]);
    this.recipientLockingBytecode = lock.bytecode;
    this.options = options;
  }

  static fromString(str: string, network = "mainnet"): Perpetuity {
    let p = this.parseSerializedString(str, network);

    // if the contract shortcode doesn't match, error
    if (!(this.c == p.code))
      throw `non-${this.name} serialized string passed to ${this.name} constructor`;

    if (p.options.version != 1)
      throw Error(`${this.name} contract version not recognized`);
    if (p.args.length != 4)
      throw `invalid number of arguments ${p.args.length}`;

    const period = parseInt(p.args.shift()!);

    const lock = p.args.shift()!;

    const prefix = getPrefixFromNetwork(network);
    const address = lockingBytecodeToCashAddress(hexToBin(lock), prefix);
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    const executorAllowance = parseInt(p.args.shift()!);
    const decay = parseInt(p.args.shift()!);

    let perpetuity = new Perpetuity(
      period,
      address,
      executorAllowance,
      decay,
      p.options
    );

    // check that the address
    perpetuity.checkLockingBytecode(p.lockingBytecode);
    return perpetuity;
  }

  // Create a Perpetuity contract from an OpReturn by building a serialized string.
  static fromOpReturn(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): Perpetuity {
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
    const decay = binToNumber(p.args.shift()!);

    let perpetuity = new Perpetuity(
      period,
      address,
      executorAllowance,
      decay,
      p.options
    );

    // check that the address
    perpetuity.checkLockingBytecode(p.lockingBytecode);
    return perpetuity;
  }

  override toString() {
    return [
      `${Perpetuity.c}`,
      `${this.options!.version}`,
      `${this.period}`,
      `${deriveLockingBytecodeHex(this.address)}`,
      `${this.executorAllowance}`,
      `${this.decay}`,
      `${this.getLockingBytecode()}`,
    ].join(Perpetuity.delimiter);
  }

  override asText(): string {
    return `Perpetuity to pay 1/${this.decay} the input, every ${this.period} blocks, after a ${this.executorAllowance} (sat) executor allowance`;
  }

  toOpReturn(hex = false): string | Uint8Array {
    const chunks = [
      Perpetuity._PROTOCOL_ID,
      Perpetuity.c,
      toHex(this.options!.version!),
      toHex(this.period),
      "0x" + deriveLockingBytecodeHex(this.address),
      toHex(this.executorAllowance),
      toHex(this.decay),
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

  async asSeries(){
    const currentHeight = await getBlockHeight()
    let currentTime = Math.floor(Date.now()/1000)
    let utxos = await this.getUtxos()
    let series:any = {}
    if(utxos){
      for(const utxo of utxos){
        let time = []
        let payout = []
        let principal = []
        let allowance = []
        // @ts-ignore
        if(utxo.height==0){
          time.push(currentTime+ this.period*600)
        }else{
          // @ts-ignore
          let nextCallableBlockTime = this.period-(currentHeight-utxo.height)
          time.push(currentTime+ (nextCallableBlockTime)*600)
        }
        payout.push(Math.floor(utxo.satoshis/this.decay)-this.executorAllowance)
        principal.push(utxo.satoshis-payout.at(-1)!)
        allowance.push(this.executorAllowance)

        let watchdog = 0
        while(payout.at(-1)!>this.executorAllowance && watchdog<1000){
            time.push(time.at(-1)! + this.period*600)
            payout.push(Math.floor(principal.at(-1)!/this.decay)-this.executorAllowance)
            principal.push(principal.at(-1)!-payout.at(-1)!)
            allowance.push(this.executorAllowance)
            watchdog += 1
        }

        let utxoId = `${utxo.txid}:${utxo.vout.toString()}`
        series[utxoId] = {
          "time": time,
          "principal" : principal,
          "payout": payout,
          "executorAllowance": allowance
        }
      } // for utxos
    } // if utxos
    return series
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

    let fn = this.getFunction(Perpetuity.fn)!;
    let installment = Math.round(currentValue / this.decay)+1;
    let newPrincipal = currentValue - (installment + this.executorAllowance);

    // round up
    installment += 2;
    newPrincipal += 3;

    let to = [
      {
        to: this.address,
        amount: installment,
      },
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

    // // Calculate value returned to the contract
    // int returnedValue = currentValue - installment - executorAllowance;
    //console.log(newPrincipal, currentValue, installment, executorFee)
    

    tx = fn();
    if (utxos) tx = tx.from(utxos);
    let payTx = await tx!.to(to).withAge(this.period).withoutChange().send();
    return payTx.txid;

  }
}
