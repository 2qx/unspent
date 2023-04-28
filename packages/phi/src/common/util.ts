import {
  binToHex,
  binToNumberUintLE,
  decodeCashAddressFormat,
  decodeBase58Address,
  decodeCashAddress,
  decodeCashAddressFormatWithoutPrefix,
  cashAddressToLockingBytecode,
  CashAddressNetworkPrefix,
  hexToBin,
  instantiateSha256,
  instantiateRipemd160,
  isBech32CharacterSet,
  utf8ToBin,
  numberToBinUintLE,
  encodeCashAddress,
  encodeCashAddressFormat,
  CashAddressType,
} from "@bitauth/libauth";

import { Op, encodeNullDataScript } from "@cashscript/utils";

/**
 * Helper function to convert an address to a public key hash
 *
 * @param address   Address to convert to a hash
 *
 * @returns a public key hash corresponding to the passed address
 */
export function derivePublicKeyHash(address: string): Uint8Array {
  let result;

  // If the address has a prefix decode it as is
  if (address.includes(":")) {
    result = decodeCashAddressFormat(address);
  }
  // otherwise, derive the network from the address without prefix
  else {
    result = decodeCashAddressFormatWithoutPrefix(address);
  }

  if (typeof result === "string") throw new Error(result);

  // return the public key hash
  return result.payload;
}

export function derivePublicKeyHashHex(address: string): string {
  return binToHex(derivePublicKeyHash(address));
}

export function deriveLockingBytecodeHex(address: string): string {
  const bytecode = deriveLockingBytecode(address);
  return binToHex(bytecode);
}

export function deriveLockingBytecode(address: string): Uint8Array {
  const lock = cashAddressToLockingBytecode(address);
  if (typeof lock === "string") throw lock;
  return lock.bytecode;
}

export async function sanitizeAddress(wildString: string) {
  if (typeof wildString != "string")
    throw Error("Cashaddress was not a string");
  // If the address has a prefix decode it as is
  let r, cashAddr;

  // Throw on segwit address
  if (
    wildString.substring(0, 3) === "bc1" ||
    wildString.substring(0, 3) === "tb1"
  )
    throw Error("Refusing to convert segwit P2SH address to cashaddress");

  if (wildString.includes(":")) {
    r = decodeCashAddressFormat(wildString);
  } else {
    // If not Bech32, try to decode a Base58 address
    if (!isBech32CharacterSet(wildString)) {
      if (wildString[0] === "3" || wildString[0] === "2")
        throw Error(
          "Refusing to convert a legacy P2SH address (possibly segwit) to cashaddress"
        );

      r = decodeBase58Address(wildString);
      if (typeof r === "string") throw Error(r);

      let prefix;
      if (r.version === 0 || r.version === 5) {
        prefix = "bitcoincash";
      } else if (r.version === 111) {
        prefix = "bchtest";
      } else {
        throw Error("Couldn't identify type of legacy address");
      }
      cashAddr = encodeCashAddress(prefix as CashAddressNetworkPrefix, "p2pkh", r.payload);
      return cashAddr;
    } else {
      r = decodeCashAddressFormatWithoutPrefix(wildString);
    }
  }
  // otherwise, derive the network from the address without prefix
  if (typeof r === "string") throw Error(r);
  cashAddr = encodeCashAddressFormat(r.prefix, r.version, r.payload);
  return cashAddr;
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

export function createOpReturnData(opReturnData: string[]): Uint8Array {
  const script = [
    Op.OP_RETURN,
    ...opReturnData.map((output: string) => toBin(output)),
  ];

  return encodeNullDataScript(script);
}

export function toBin(output: string): Uint8Array {
  const data = output.replace(/^0x/, "");
  const encode = data === output ? utf8ToBin : hexToBin;
  return encode(data);
}

export function toHex(num: number|bigint): string {
  num = Number(num)
  let hex = binToHex(numberToBinUintLE(num)).toUpperCase();
  if (!hex) hex = "00";
  return "0x" + hex;
}

export function binToNumber(data: Uint8Array): number {
  const h = binToNumberUintLE(data);
  return h;
}

export function binToBigInt(data: Uint8Array): bigint {
  const h = binToNumberUintLE(data);
  return BigInt(h);
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

/**
 * hash160 - Calculate the sha256, ripemd160 hash of a value
 *
 * @param {message} Uint8Array       value to hash as a binary array
 *
 * @returns a promise to the hash160 value of the input
 */
export async function hash160(message: Uint8Array) {
  const ripemd160 = await instantiateRipemd160();
  const sha256 = await instantiateSha256();
  return ripemd160.hash(sha256.hash(message));
}

/**
 * sha256 - Calculate the sha256 a value
 *
 * @param {message} Uint8Array       value to hash as a binary array
 *
 * @returns a promise to the sha256 value of the input
 */
export async function sha256(message: Uint8Array) {
  const sha256 = await instantiateSha256();
  return sha256.hash(message);
}

// Simple function to get a random integer
export function getRandomIntWeak(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

export function sum(previousValue: any, currentValue: any) {
  return previousValue + currentValue;
}

export function parseBigInt(num:string):bigint{
  return BigInt(parseInt(num))
}

export function assurePkh(address: string){
  const cashaddrInfo = decodeCashAddress(address)
  if(typeof cashaddrInfo === "string") throw Error(cashaddrInfo)
  if(cashaddrInfo.type!=CashAddressType.p2pkh) throw ("Provided address was not a pay to public key hash address")
}

