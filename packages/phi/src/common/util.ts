import {
    binToHex,
    binToNumberUintLE,
    decodeCashAddressFormat,
    decodeCashAddressFormatWithoutPrefix,
    cashAddressToLockingBytecode,
    CashAddressNetworkPrefix,
    hexToBin,
    instantiateSha256, 
    instantiateRipemd160,
    utf8ToBin,
    numberToBinUintLE
  } from "@bitauth/libauth";

  import { Op, encodeNullDataScript } from "@cashscript/utils"

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
    return result.hash;
  }

  export function derivePublicKeyHashHex(address:string): string{
     return binToHex(derivePublicKeyHash(address))
  }
 
  export function deriveLockingBytecodeHex(address:string): string{
    let bytecode = deriveLockingBytecode(address)
    return binToHex(bytecode)
 }

 export function deriveLockingBytecode(address:string): Uint8Array{
  let lock = cashAddressToLockingBytecode(address)
  if(typeof(lock)==="string") throw lock
  return lock.bytecode
}
 
  export function getPrefixFromNetwork(network: string) : CashAddressNetworkPrefix{
    let prefix = !network ? CashAddressNetworkPrefix.mainnet : undefined
    if(!prefix){
      if(network=="mainnet") prefix=CashAddressNetworkPrefix.mainnet
      if(network=="staging") prefix=CashAddressNetworkPrefix.testnet
      if(network=="regtest") prefix=CashAddressNetworkPrefix.regtest
    }
    if(!prefix) throw Error("unknown network")
    return prefix
  }


  export function createOpReturnData(
    opReturnData: string[],
  ): Uint8Array {
      
    const script = [
      Op.OP_RETURN,
      ...opReturnData.map((output: string) => toBin(output)),
    ];
  
    return encodeNullDataScript(script);
  }

  export function toBin(output: string): Uint8Array {
    const data = output.replace(/^0x/, '');
    const encode = data === output ? utf8ToBin : hexToBin;
    return encode(data);
  }

  export function toHex(num: number): string{ 
    let hex = binToHex(numberToBinUintLE(num)).toUpperCase()
    if(!hex) hex = "00"
    return "0x"+ hex
  }

export function binToNumber(data: Uint8Array) : number{
  let h = binToNumberUintLE(data)
  return h
}

// For decoding OP_RETURN data 
export function decodeNullDataScript(data : Uint8Array) {
  if(data.slice(0,1)[0] !== 106){
    throw Error("Attempted to decode NullDataScript without a OP_RETURN code (106), not an OpReturn output?")
  }
  
  // skip the OP_RETURN code data[0]
  let i =1;

  let r:Uint8Array[] = []
  while(i<data.length){
    if(data.slice(i,i+1)[0] === 0x4c){
      console.log("76")
      r.push(data.slice(i,i+1))
      i+1
    }else if(data.slice(i,i+1)[0] === 0x4d){
      throw Error("Not Implemented")
    }else{
      let len = data.slice(i,i+1)[0]!
      let start = i+1
      let end = start+len
      r.push(data.slice(start,end))
      i = end
    }
  }
  return r
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

export function sum(previousValue:any, currentValue:any) {
  return previousValue + currentValue;
}


/**
 * Mine bitcoin blocks on a local regtest node to a regtest address
 *
 * @param cashaddr - the address to mine to
 * @param blocks - the number of blocks to mine
 *
 * @remarks
 * This function assumes a local regtest bitcoin node with RPC_* matching the docker configuration
 */

 export async function mine({
  cashaddr,
  blocks,
}: {
  cashaddr: string;
  blocks: number;
}) {

  const generateArgs = [
    `exec`,
    `bitcoind`,
    `bitcoin-cli`,
    `--rpcconnect=${process.env['RPC_HOST']}`,
    `--rpcuser=${process.env['RPC_USER']}`,
    `--rpcpassword=${process.env['RPC_PASS']}`,
    `--rpcport=${process.env['RPC_PORT']}`,
    `generatetoaddress`,
    blocks,
    cashaddr,
  ];
  const spawnSync = eval('require("child_process")').spawnSync;
  const cli = await spawnSync(`docker`, generateArgs);
  if (cli.stderr.length > 0) {
    return console.log("Mine Error: " + cli.stderr.toString());
  }
  return JSON.parse(cli.stdout.toString());
}