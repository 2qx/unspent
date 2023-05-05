import {
  BytecodePatternQueryDefaults,
  BytecodePatternExtendedQueryI,
  BytecodePatternQueryI,
} from "./interface.js"

import { PROTOCOL_ID } from "../constant.js";

import { 
  binToHex, 
  binToNumberUintLE, 
  hexToBin, 
  CashAddressNetworkPrefix,
  lockingBytecodeToCashAddress 
} from "@bitauth/libauth";

export function prepareBytecodeQueryParameters(param?: BytecodePatternExtendedQueryI | BytecodePatternQueryI) {
  if (!param) param = {}
  param = { ...BytecodePatternQueryDefaults, ...param }

  // convert the code to uppercase, then ascii, padding it with the number of bytes
  if ("code" in param && param.code) {
    if (param.code.toLowerCase().match(/[a-z]/i)) {
      const codeAscii = param.code!.toUpperCase().charCodeAt(0).toString(16);
      param.prefix += "01" + codeAscii
      // 
      // version comes after code... pad with zeros.
      if ("version" in param) {
        if (Number.isInteger(param.version)) param.prefix += "01" + ("00" + param.version!.toString()).slice(-2);
      }
    }


  }
  if ("code" in param) delete param.code
  if ("version" in param) delete param.version
  return param
}


/// TODO move to @unspent/util

export function parseOpReturn(opReturn: Uint8Array | string, network = "mainnet") {
  // transform to binary
  if (typeof opReturn == "string") {
    opReturn = hexToBin(opReturn);
  }

  // decode data
  const components = decodeNullDataScript(opReturn);

  const protocol = binToHex(components.shift()!);
  if (protocol !== PROTOCOL_ID)
    throw Error(
      `Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`
    );

  // if the contract shortcode doesn't match, error
  const code = String.fromCharCode(components.shift()![0]!);
  const version = binToNumber(components.shift()!);
  const lockingBytecode = components.splice(-1)[0]!;
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

// For decoding OP_RETURN data
export function decodeNullDataScript(data: Uint8Array | string) {
  if (typeof data === "string") data = hexToBin(data);

  if (data.slice(0, 1)[0] !== 106) {
    throw Error(
      "Attempted to decode NullDataScript without a OP_RETURN code (106), not an OpReturn output?"
    );
  }

  // skip the OP_RETURN code data[0]
  let i = 1;

  const r: Uint8Array[] = [];
  while (i < data.length) {
    if (data.slice(i, i + 1)[0] === 0x4c) {
      r.push(data.slice(i, i + 1));
      i + 1;
    } else if (data.slice(i, i + 1)[0] === 0x4d) {
      throw Error("Not Implemented");
    } else {
      const len = data.slice(i, i + 1)[0]!;
      const start = i + 1;
      const end = start + len;
      r.push(data.slice(start, end));
      i = end;
    }
  }
  return r;
}


export function binToNumber(data: Uint8Array): number {
  const h = binToNumberUintLE(data);
  return h;
}


export function getPrefixFromNetwork(
  network: string
): CashAddressNetworkPrefix {
  let prefix = !network ? CashAddressNetworkPrefix.mainnet : undefined;
  if (!prefix) {
    if (network == "mainnet") prefix = CashAddressNetworkPrefix.mainnet;
    if (network == "staging") prefix = CashAddressNetworkPrefix.testnet;
    if (network == "chipnet") prefix = CashAddressNetworkPrefix.testnet;
    if (network == "regtest") prefix = CashAddressNetworkPrefix.regtest;
  }
  if (!prefix) throw Error("unknown network");
  return prefix;
}