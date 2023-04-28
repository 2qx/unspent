
import {
  PsiOutpointI,
  Utxo
} from "./interface.js";

const FLAG_TYPED_ARRAY = "FLAG_TYPED_ARRAY";

// @ts-ignore
export function serialize(key: any, value: any) {
  // the replacer function is looking for some typed arrays.
  // If found, it replaces it by a trio
  if (value instanceof Int8Array ||
    value instanceof Uint8Array ||
    value instanceof Uint8ClampedArray ||
    value instanceof Int16Array ||
    value instanceof Uint16Array ||
    value instanceof Int32Array ||
    value instanceof Uint32Array ||
    value instanceof Float32Array ||
    value instanceof Float64Array) {
    var replacement = {
      constructor: value.constructor.name,
      // @ts-ignore
      data: Array.apply([], value),
      flag: FLAG_TYPED_ARRAY
    }
    return replacement;
  }
  return value;

}

// @ts-ignore
export function deserialize(key: any, value: any) {
  // the reviver function looks for the typed array flag
  try {
    if ("flag" in value && value.flag === FLAG_TYPED_ARRAY) {
      // if found, we convert it back to a typed array
      // @ts-ignore
      return new globalThis[value.constructor](value.data);
    }
  } catch (e) { }

  // if flag not found no conversion is done
  return value;
}


export function getMaxBlockHeight(utxos: Utxo[]){
  const max = Math.max( ... utxos.map(u => u.height!))
  
  return max < 0 ? 0 : max
}

// There can only be 21M!, utxo formats.
// convert db utxo to standard electrumX/fulcrum format
export function asUtxo(utxo: PsiOutpointI): Utxo {
  
  let id = utxo.id.split(":")
  return {
    txid: id[0]!,
    vout: parseInt(id[1]!),
    height: utxo.height,
    satoshis: utxo.value
  }
}

export function sleep (ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
