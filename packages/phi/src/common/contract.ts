import {
  binToHex,
  hexToBin,
  instantiateSha256,
  lockingBytecodeToBase58Address,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import {
  Argument,
  Artifact,
  Contract as CashScriptContract,
  Utxo,
} from "cashscript";
import { ElectrumNetworkProvider } from "cashscript";

import {
  getDefaultProvider
} from "./network.js";

import {
  binToNumber,
  createOpReturnData,
  decodeNullDataScript,
  deriveLockingBytecode,
  deriveLockingBytecodeHex,
  getPrefixFromNetwork,
} from "./util.js";
import { DELIMITER, PROTOCOL_ID, _PROTOCOL_ID } from "./constant.js";

export class BaseUtxPhiContract {
  private artifact: Artifact;
  private contract: CashScriptContract;
  protected testnet: boolean;
  public provider?: ElectrumNetworkProvider;

  public static delimiter: string = DELIMITER;
  public static _PROTOCOL_ID: string = _PROTOCOL_ID;
  public static PROTOCOL_ID: string = PROTOCOL_ID;

  constructor(
    network: string,
    artifact: Artifact,
    constructorArguments: Argument[]
  ) {
    let defaultProvider = getDefaultProvider(network);
    this.provider = defaultProvider as ElectrumNetworkProvider
    this.testnet = this.provider.network == "mainnet" ? false: true

    this.artifact = artifact;
    this.contract = new CashScriptContract(
      artifact,
      [...constructorArguments],
      this.provider
    );
  }

  _refresh(constructorArguments: Argument[]) {
    this.contract = new CashScriptContract(
      this.artifact,
      [...constructorArguments],
      this.provider
    );
  }

  static parseSerializedString(str: string, network = "mainnet") {
    const components = str.split(this.delimiter);

    // if the contract shortcode doesn't match, error
    const code = components.shift();
    const version = parseInt(components.shift()!);
    const lockingBytecode = components.splice(-1)[0];
    const args = [...components];
    const options = { version: version, network: network };

    const prefix = getPrefixFromNetwork(network);
    const address = lockingBytecodeToCashAddress(
      hexToBin(lockingBytecode!),
      prefix
    );
    if (typeof address !== "string")
      throw Error("non-standard address" + address);

    return {
      code: code,
      options: options,
      args: args,
      lockingBytecode: lockingBytecode,
      address: address,
    };
  }

  static parseOpReturn(opReturn: Uint8Array | string, network = "mainnet") {
    // transform to binary
    if (typeof opReturn == "string") {
      opReturn = hexToBin(opReturn);
    }

    // decode data
    const components = decodeNullDataScript(opReturn);

    let protocol = binToHex(components.shift()!);
    if (protocol !== PROTOCOL_ID)
      throw Error(
        `Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`
      );

    // if the contract shortcode doesn't match, error
    const code = String.fromCharCode(components.shift()![0]!);
    const version = binToNumber(components.shift()!);
    const lockingBytecode = components.splice(-1)[0];
    const args = [...components];
    const options = { version: version, network: network };

    const prefix = getPrefixFromNetwork(network);
    const address = lockingBytecodeToCashAddress(lockingBytecode!, prefix);
    if (typeof address !== "string")
      throw Error("non-standard address:" + address);

    return {
      code: code,
      options: options,
      args: args,
      lockingBytecode: lockingBytecode,
      address: address,
    };
  }

  // @ts-ignore
  // static async getSpendable(opReturn: Uint8Array | string, network = "mainnet", networkProvider: ElectrumNetworkProvider, blockHeight?: number): Promise<number> {
  //   throw Error("Cannot get spendable amount from base class");
  // }


  static getExecutorAllowance(
    opReturn: Uint8Array | string,
    network = "mainnet"
  ): number {
    throw Error(`Cannot get executor allowance from base class, ${opReturn} on ${network}`);
  }

  static async getSpendableBalance(
    opReturn: Uint8Array | string,
    network = "mainnet",
    networkProvider?: ElectrumNetworkProvider,
    blockHeight?: number
  ): Promise<number> {
    networkProvider
    blockHeight
    throw Error(`Cannot get spendable amount from base class, ${opReturn} on ${network}`);
  }

  async getBalance(): Promise<number> {
    let bal = await this.contract.getBalance();
    return bal;
  }

  getAddress(): string {
    return this.contract.address;
  }

  async getLegacyAddress(): Promise<string>{
    let sha256 = await instantiateSha256()
    let addr =  lockingBytecodeToBase58Address(sha256, this.getLockingBytecode(false) as Uint8Array, this.testnet ? 'testnet' : 'mainnet' )
    if(typeof addr !== 'string') throw Error("could not encode legacy address")
    return addr
  }

  async getUtxos(): Promise<Utxo[] | undefined> {
    return await this.provider?.getUtxos(this.getAddress());
  }

  getLockingBytecode(hex = true): string | Uint8Array {
    if (hex) return deriveLockingBytecodeHex(this.contract.address);
    return deriveLockingBytecode(this.contract.address);
  }

  checkLockingBytecode(lockingBytecode?: string | Uint8Array): boolean {
    if (!lockingBytecode)
      throw Error("Attempted to check an empty locking bytecode");
    if (typeof lockingBytecode != "string") {
      lockingBytecode = binToHex(lockingBytecode);
    }
    if (lockingBytecode !== this.getLockingBytecode())
      throw `Deserialization resulted in different contract public key hash`;
    return true;
  }

  asText(): string {
    throw Error("Cannot get contract text description from base class");
  }

  asSeries(): Promise<any> {
    throw Error("Cannot get contract series from base class");
  }

  getRedeemScriptHex(): string {
    return this.contract.getRedeemScriptHex();
  }

  getFunction(fn: string) {
    return this.contract.functions[fn];
  }

  isTestnet() {
    return this.testnet;
  }

  asOpReturn(chunks: string[], hex: boolean) {
    let opReturn = createOpReturnData(chunks);
    if (hex) {
      return binToHex(opReturn);
    } else {
      return opReturn;
    }
  }

  async isFunded(): Promise<boolean> {
    return (await this.getBalance()) > 0;
  }

  async info(cat = true): Promise<string | undefined> {
    let bal = await this.getBalance();
    let info =
      `# ${this.asText()}\n` +
      `# ${this.toString()}\n` +
      `address:        ${this.getAddress()}\n` +
      `balance:        ${bal}\n`;
    if (cat) {
      console.log(info);
      return;
    } else {
      return info;
    }
  }
}
