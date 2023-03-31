import { binToHex, hexToBin, lockingBytecodeToCashAddress } from "@bitauth/libauth";
import { Artifact } from "@cashscript/utils";
import { ElectrumNetworkProvider, NetworkProvider, Network } from "cashscript";
import { nameMap, contractMap, CodeType } from "../contract/constant.js";
import { decodeNullDataScript } from "./util.js";
import { BaseUtxPhiContract } from "./contract.js";

type ContractType = typeof contractMap[keyof typeof contractMap];

export function parseOpReturn(serialized: string | Uint8Array) {
  if (typeof serialized === "string") {
    serialized = hexToBin(serialized);
  }

  const data = BaseUtxPhiContract.parseOpReturn(serialized);
  return {
    name: nameMap[data.code as CodeType] as string,
    opReturn: serialized,
    ...data,
  };
}

export function parseOutputs(serialized: string | Uint8Array) {
  if (typeof serialized === "string") serialized = hexToBin(serialized);
  return BaseUtxPhiContract.parseOutputs(serialized);
}

export function opReturnToInstance(
  serialized: string | Uint8Array,
  network?: string
): InstanceType<ContractType> | undefined {
  if (typeof serialized === "string") {
    serialized = hexToBin(serialized);
  }
  const serializedBinChunks = decodeNullDataScript(serialized);
  const contractCode = binToHex(serializedBinChunks[1]!);

  const code = String.fromCharCode(parseInt(contractCode, 16)) as CodeType;

  const instance = contractMap[code].fromOpReturn(serialized, network);
  return instance;
}

export function opReturnToExecutorAllowance(
  serialized: string | Uint8Array,
  network?: string
): number {
  if (typeof serialized === "string") {
    serialized = hexToBin(serialized);
  }
  const serializedBinChunks = decodeNullDataScript(serialized);
  const contractCode = binToHex(serializedBinChunks[1]!);

  const code = String.fromCharCode(parseInt(contractCode, 16)) as CodeType;

  const exAllowance = contractMap[code].getExecutorAllowance(serialized, network);
  return exAllowance;
}

export async function opReturnToSpendableBalance(
  serialized: string | Uint8Array,
  network = Network.MAINNET,
  networkProvider?: NetworkProvider,
  blockHeight?: number
): Promise<number> {
  if (typeof serialized === "string") {
    serialized = hexToBin(serialized);
  }
  const serializedBinChunks = decodeNullDataScript(serialized);
  const contractCode = binToHex(serializedBinChunks[1]!);

  const code = String.fromCharCode(parseInt(contractCode, 16)) as CodeType;

  if (!networkProvider) networkProvider = new ElectrumNetworkProvider(network);
  if (!blockHeight) blockHeight = await networkProvider.getBlockHeight();

  try{
    const spendableBalance = await contractMap[code].getSpendableBalance(
      serialized,
      network,
      networkProvider,
      blockHeight
    );
    return spendableBalance;
  }catch(e:any){
    console.log(`error getting balance for ${binToHex(serialized)}`)
    return 0
  }
  
}


export async function opReturnToBalance(
  serialized: string | Uint8Array,
  network = Network.MAINNET,
  networkProvider?: ElectrumNetworkProvider,
  blockHeight?: number
): Promise<number> {
  if (typeof serialized === "string") {
    serialized = hexToBin(serialized);
  }
  const serializedBinChunks = decodeNullDataScript(serialized);
  const address = lockingBytecodeToCashAddress(serializedBinChunks.pop()!, "bitcoincash")

  if(typeof address!=="string") throw Error("couldn't decode cashaddr")
  if (!networkProvider) networkProvider = new ElectrumNetworkProvider(network);
  if (!blockHeight) blockHeight = await networkProvider.getBlockHeight();

  const balance = await BaseUtxPhiContract.getBalance(
    address,
    networkProvider
  );
  return balance;
}

export function opReturnToSerializedString(
  serialized: string | Uint8Array,
  network?: string
): string | undefined {
  const instance = opReturnToInstance(serialized, network);
  if (instance) {
    return instance.toString();
  } else {
    return;
  }
}

export function stringToInstance(
  serialized: string,
  network: string
): InstanceType<ContractType> | undefined {
  const code = serialized[0]! as CodeType;
  try {
    const instance = contractMap[code].fromString(serialized, network);
    return instance;
  } catch (e) {
    console.warn(`Couldn't parse serialized contract, ${e}`);
    return;
  }
}

export function castConstructorParametersFromArtifact(
  parameters: string[],
  artifact: Artifact
) {
  const result = [];
  const inputs = artifact.constructorInputs;

  parameters.forEach(function (value, i) {
    const abiInput = inputs[i]!;

    let parsedVal = undefined;

    if (abiInput.type.startsWith("bytes")) {
      if (typeof value === "string") {
        if (value.includes(",")) {
          parsedVal = Uint8Array.from(
            value.split(",").map((vStr) => parseInt(vStr))
          );
        } else {
          parsedVal = hexToBin(value);
        }
      } else {
        throw Error(`Couldn't parse ${value} from string to bytes`);
      }
    } else if (abiInput.type === "int") {
      parsedVal = parseInt(value);
    } else if (abiInput.type === "boolean") {
      parsedVal = Boolean(value);
    } else {
      throw Error(`Couldn't parse type ${abiInput.type}`);
    }

    result.push({
      name: abiInput.name,
      cashScriptType: abiInput.type,
      value: parsedVal,
    });
  });
}
