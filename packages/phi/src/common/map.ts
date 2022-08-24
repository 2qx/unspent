import { binToHex, hexToBin } from "@bitauth/libauth";
import { decodeNullDataScript } from "./util";
import { contractMap } from "../contract/constant"


type C = keyof typeof contractMap;
type constractType = typeof contractMap[keyof typeof contractMap]

export function opReturnToInstance(serialized:string|Uint8Array, network?:string) : InstanceType<constractType>{
  if(typeof serialized  === "string"){
    serialized = hexToBin(serialized)
  }
  let serializedBinChunks = decodeNullDataScript(serialized)
  let contractCode = binToHex(serializedBinChunks[1]!)
  
  let code = String.fromCharCode(parseInt(contractCode, 16)) as C
  return contractMap[code].fromOpReturn(serializedBinChunks, network)
  
}

export function stringToInstance(serialized:string, network:string) : InstanceType<constractType>{
    let code = serialized[0]! as C
    return contractMap[code].fromString(serialized, network)
}