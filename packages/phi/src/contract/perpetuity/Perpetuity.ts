import { 
    binToHex,
    cashAddressToLockingBytecode,
    hexToBin,
    lockingBytecodeToCashAddress } from "@bitauth/libauth"
import type { Artifact } from "cashscript"
import type { UtxfiContract, ContractOptions } from "../../common/interface.js"
import { DELIMITER, DefaultOptions, PROTOCOL_ID } from "../../common/constant.js"
import { BaseUtxfiContract } from "../../common/contract.js"
import { binToNumber, derivePublicKeyHashHex, 
    deriveLockingBytecodeHex,
    getPrefixFromNetwork, toHex } from "../../common/util.js"
import { artifact as v1 } from "./cash/v1.js"
import { artifact as v2 } from "./cash/v1.js"


export class Perpetuity extends BaseUtxfiContract implements UtxfiContract {

    private static c: string = "P"; 
    private static delimiter: string = DELIMITER;
    private static fn: string = "execute";


    constructor(
        public period: number = 4000,
        public address: string,
        public executorAllowance: number,
        public decay: number,
        public options: ContractOptions = DefaultOptions
      ) {
        let script:Artifact
        if(options.version===1){
            script = v1  
        }
        else if(options.version===2){
            script = v2     
        }else{
            throw Error("Unrecognized Perpetuity Version")
        }
        let lock = cashAddressToLockingBytecode(address)
        if(typeof(lock)==="string") throw lock
        let bytecode = lock.bytecode

        super(options.network!, script, [period, bytecode, executorAllowance, decay] );
        this.options = options
    }


    static fromString(str: string, network="mainnet"): Perpetuity {
        let comp = str.split(Perpetuity.delimiter)
        
        // if the contract shortcode doesn't match, error
        if(!(Perpetuity.c ==comp.shift())) throw("non-Perpetuity serialized string passed to Perpetuity constructor")
        let version = parseInt(comp.shift()!)
        let options = {version: version, network: network}

        // split off the last argument, the address pkh, save it as the checksum
        let checksum = comp.splice(-1)[0]

        let period = parseInt(comp.shift()!)
        
        let lock = comp.shift()!

        let prefix = getPrefixFromNetwork(network)
        let address = lockingBytecodeToCashAddress(hexToBin(lock), prefix)
        if(typeof(address) !== "string") throw Error("non-standard address" + address)


        let [executorAllowance, decay] = [3000, 120]
        if(version==1){
            executorAllowance = parseInt(comp.shift()!)
            decay = parseInt(comp.shift()!)
        }else{
            throw Error("Perpetuity contract version not recognized")
        }
        let perpetuity = new Perpetuity(period, address, executorAllowance, decay, options)
        
        // check that the address matches
        if(!(checksum==derivePublicKeyHashHex(perpetuity.getAddress()))) throw("Perpetuity deserializtion resulted in different contract public key hash")
        return perpetuity
    }

    // Create a Annunity contract from an OpReturn by building a serialized string.
    static fromOpReturn(chunks:Uint8Array[], network="mainnet"): Perpetuity {

        let protocol = "0x"+ binToHex(chunks.shift()!)
        if(protocol !== PROTOCOL_ID) throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`)
        let charArray = chunks.shift()!

        let c = String.fromCharCode(charArray[0]!)!;
        if(c!==this.c) throw Error(`Wrong short code passed to Perpetuity class: ${c}`)
        
        // version
        let version = binToNumber(chunks.shift()!);
        if(version !==1) throw Error(`Wrong version code passed to Perpetuity class: ${version}`)
        let options = {version: version, network: network}

        // split off the last argument, the address pkh, save it as the checksum
        let checksum = chunks.pop()!

        let period = binToNumber(chunks.shift()!)
        let lock = chunks.shift()!

        let prefix = getPrefixFromNetwork(network)
        let address = lockingBytecodeToCashAddress(lock, prefix)
        JSON.stringify(address)
        if(typeof(address) !== "string") throw Error("non-standard address" + address)


        let [executorAllowance, decay] = [3000, 120]
        if(version==1){
            executorAllowance = binToNumber(chunks.shift()!)
            decay = binToNumber(chunks.shift()!)
        }else{
            throw Error("Perpetuity contract version not recognized")
        }

        let perpetuity = new Perpetuity(period, address, executorAllowance, decay, options)
        
        // check that the address 
        if(binToHex(checksum) !==derivePublicKeyHashHex(perpetuity.getAddress())) throw("Perpetuity deserializtion resulted in different contract public key hash")
        return perpetuity
    }

    override toString(){
        return [`${Perpetuity.c}`,
               `${this.options!.version}`,
               `${this.period}`,
               `${deriveLockingBytecodeHex(this.address)}`,
               `${this.executorAllowance}`,
               `${this.decay}`,
               `${derivePublicKeyHashHex(this.getAddress())}`].join(Perpetuity.delimiter)
    }

    toChunks(): string[]{
        return [Perpetuity.c,
               toHex(this.options!.version!),
               toHex(this.period),
               '0x'+ deriveLockingBytecodeHex(this.address),
               toHex(this.executorAllowance),
               toHex(this.decay),
               '0x'+ derivePublicKeyHashHex(this.getAddress())]
    }

    async info(){
        console.log(`# Perpetuity to pay 1/${this.decay} total, every ${this.period} blocks, after a ${this.executorAllowance} (sat) executor allowance`)
        console.log('# ', this.toString());
        console.log('contract address:          ', this.address);
        console.log("contract principal:        ", await this.getBalance());
    }


    async execute(exAddress?: string, fee?:number): Promise<string> {
        let balance = await this.getBalance();

        if(balance==0) throw Error("No funds on contract")
        
        let fn = this.getFunction(Perpetuity.fn)!;
        let installment = Math.round(balance / this.decay);
        
        let newPrincipal = balance - (installment + this.executorAllowance)
        let minerFee = fee ? fee : 154;
        let executorFee = balance - (installment + newPrincipal + minerFee) - 1

        let outputs = [
            { 
                to: this.address,
                amount: installment
            },
            {
                to: this.getAddress(),
                amount: newPrincipal,
            }
        ]
    
        if(typeof(exAddress)==="string" && exAddress) outputs.push(
            { 
                to: exAddress,
                amount: executorFee
            })
    
        try{
            let payTx1 = await fn()
            .to(outputs)
            .withAge(this.period)
            .withoutChange()
            .build();
            console.log(payTx1)
            let payTx = await fn()
                .to(outputs)
                .withAge(this.period)
                .withoutChange()
                .send();
            return payTx.txid
        }catch(e){
            throw(e)
        }
    }

}
