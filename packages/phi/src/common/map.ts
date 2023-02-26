import { binToHex, hexToBin } from "@bitauth/libauth";
import { Artifact } from "@cashscript/utils";
import { ElectrumNetworkProvider, Network } from "cashscript";
import { nameMap, contractMap, CodeType } from "../contract/constant.js";
import { decodeNullDataScript } from "./util.js";
import { BaseUtxPhiContract } from "./contract.js";

type ContractType = typeof contractMap[keyof typeof contractMap];

export function parseOpReturn(serialized: string | Uint8Array) {
  if (typeof serialized === "string") {
    serialized = hexToBin(serialized);
  }

  let data = BaseUtxPhiContract.parseOpReturn(serialized);
  return {
    name: nameMap[data.code as CodeType] as string,
    opReturn: serialized,
    ...data,
  };
}

export function opReturnToInstance(
  serialized: string | Uint8Array,
  network?: string
): InstanceType<ContractType> | undefined {
  if (typeof serialized === "string") {
    serialized = hexToBin(serialized);
  }
  let serializedBinChunks = decodeNullDataScript(serialized);
  let contractCode = binToHex(serializedBinChunks[1]!);

  let code = String.fromCharCode(parseInt(contractCode, 16)) as CodeType;

  let instance = contractMap[code].fromOpReturn(serialized, network);
  return instance;
}

export function opReturnToExecutorAllowance(
  serialized: string | Uint8Array,
  network?: string
): number {
  if (typeof serialized === "string") {
    serialized = hexToBin(serialized);
  }
  let serializedBinChunks = decodeNullDataScript(serialized);
  let contractCode = binToHex(serializedBinChunks[1]!);

  let code = String.fromCharCode(parseInt(contractCode, 16)) as CodeType;

  let exAllowance = contractMap[code].getExecutorAllowance(serialized, network);
  return exAllowance;
}

export async function opReturnToSpendableBalance(
  serialized: string | Uint8Array,
  network = Network.MAINNET,
  networkProvider?: ElectrumNetworkProvider,
  blockHeight?: number
): Promise<number> {
  if (typeof serialized === "string") {
    serialized = hexToBin(serialized);
  }
  let serializedBinChunks = decodeNullDataScript(serialized);
  let contractCode = binToHex(serializedBinChunks[1]!);

  let code = String.fromCharCode(parseInt(contractCode, 16)) as CodeType;

  if (!networkProvider) networkProvider = new ElectrumNetworkProvider(network);
  if (!blockHeight) blockHeight = await networkProvider.getBlockHeight();

  let spendableBalance = await contractMap[code].getSpendableBalance(
    serialized,
    network,
    networkProvider,
    blockHeight
  );
  return spendableBalance;
}

export function opReturnToSerializedString(
  serialized: string | Uint8Array,
  network?: string
): string | undefined {
  let instance = opReturnToInstance(serialized, network);
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
  let code = serialized[0]! as CodeType;
  try {
    let instance = contractMap[code].fromString(serialized, network);
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
  let result = [];
  let inputs = artifact.constructorInputs;

  parameters.forEach(function (value, i) {
    let abiInput = inputs[i]!;

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
