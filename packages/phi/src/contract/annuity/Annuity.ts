
import { 
    binToHex, 
    hexToBin, 
    cashAddressToLockingBytecode, 
    lockingBytecodeToCashAddress 
} from "@bitauth/libauth"
import type { Artifact } from "cashscript"
import type { UtxfiContract, ContractOptions } from "../../common/interface.js"
import { DELIMITER, DefaultOptions, PROTOCOL_ID } from "../../common/constant.js"
import { BaseUtxfiContract } from "../../common/contract.js"
import { 
    getPrefixFromNetwork, 
    deriveLockingBytecodeHex,
    binToNumber, 
    toHex 
    } from "../../common/util.js"
import { artifact as v1 } from "./cash/v1.js"

export class Annuity extends BaseUtxfiContract implements UtxfiContract {

    private static c: string = 'A';  //A
    private static delimiter: string = DELIMITER;
    private static fn: string = "execute";


    constructor(
        public period: number = 4000,
        public address:any,
        public installment:number,
        public executorAllowance:number = 800,
        public options: ContractOptions = DefaultOptions
      ) {

        let script:Artifact
        if(options.version===1){
              script = v1     
        }else{
            throw Error("Unrecognized Annuity Version")
        }
        let lock = cashAddressToLockingBytecode(address)
        if(typeof(lock)==="string") throw lock
        let bytecode = lock.bytecode
        
  
        super(options.network!, script, [period, bytecode, installment, executorAllowance] );
        this.options = options
    }


    static fromString(str: string, network="mainnet"): Annuity {
        let comp = str.split(Annuity.delimiter)
        
        // if the contract shortcode doesn't match, error
        if(!(Annuity.c ==comp.shift())) throw("non-Annuity serialized string passed to Annuity constructor")
        let version = parseInt(comp.shift()!)
        let options = {version: version, network: network}

        // split off the last argument, the address pkh, save it as the checksum
        let checksum = comp.splice(-1)[0]

        let period = parseInt(comp.shift()!)
        let lock = comp.shift()!

        let prefix = getPrefixFromNetwork(network)
        let address = lockingBytecodeToCashAddress(hexToBin(lock), prefix)
        if(typeof(address) !== "string") throw Error("non-standard address" + address)


        let [installment, executorAllowance] = [30000,3000]
        if(version==1){
           installment = parseInt(comp.shift()!) 
           executorAllowance = parseInt(comp.shift()!)   
        }else{
            throw Error("Annuity contract version not recognized")
        }

        let annuity = new Annuity(period, address, installment, executorAllowance, options)
        
        // check that the address 
        if(checksum!==annuity.getLockingBytecode()) throw("Annuity deserializtion resulted in different contract public key hash")
        return annuity
    }

    // Create a Annunity contract from an OpReturn by building a serialized string.
    static fromOpReturn(chunks:Uint8Array[], network="mainnet"): Annuity {

        let protocol = "0x"+ binToHex(chunks.shift()!)
        if(protocol !== PROTOCOL_ID) throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`)
        let charArray = chunks.shift()!
        
        let c = String.fromCharCode(charArray[0]!)!;
        if(c!==this.c) throw Error(`Wrong short code passed to Annuity class: ${c}`)
        
        
        // version
        let version = binToNumber(chunks.shift()!);
        if(version !==1) throw Error(`Wrong version code passed to Annuity class: ${version}`)
        let options = {version: version, network: network}

        // split off the last argument, the address pkh, save it as the checksum
        let checksum = chunks.pop()!

        let period = binToNumber(chunks.shift()!)
        let lock = chunks.shift()!

        let prefix = getPrefixFromNetwork(network)
        let address = lockingBytecodeToCashAddress(lock, prefix)
        if(typeof(address) !== "string") throw Error("non-standard address" + address)


        let [installment, executorAllowance] = [30000,3000]
        if(version==1){
           installment = binToNumber(chunks.shift()!) 
           executorAllowance = binToNumber(chunks.shift()!)
        }else{
            throw Error("Annuity contract version not recognized")
        }

        let annuity = new Annuity(period, address, installment, executorAllowance, options)
        
        // check that the address 
        if(binToHex(checksum)!==annuity.getLockingBytecode()) throw("Annuity deserializtion resulted in different contract public key hash")
        return annuity
    }

    override toString(){
        return [`${Annuity.c}`,
               `${this.options!.version!}`,
               `${this.period}`,
               `${deriveLockingBytecodeHex(this.address)}`,
               `${this.installment}`,
               `${this.executorAllowance}`,
               `${this.getLockingBytecode()}`].join(Annuity.delimiter)
    }

    toChunks(): string[]{
        return [PROTOCOL_ID,
               Annuity.c,
               toHex(this.options!.version!),
               toHex(this.period),
               '0x'+deriveLockingBytecodeHex(this.address),
               toHex(this.installment),
               toHex(this.executorAllowance),
               '0x'+this.getLockingBytecode()]
    }

    async info(){
        console.log(`# Annuity paying ${this.installment} (sat), every ${this.period} blocks, after a ${this.executorAllowance} (sat) executor allowance`)
        console.log('# ', this.toString());
        console.log('contract address:          ', this.address);
        console.log("contract principal:        ", await this.getBalance());
    }
    
    async execute(exAddress?: string, fee?:number): Promise<string> {
        let balance = await this.getBalance();
        if(balance==0) throw Error("No funds on contract")
        
        let fn = this.getFunction(Annuity.fn)!;
        let installment = Math.round(balance - this.installment);
        
        let newPrincipal = balance - (this.installment + this.executorAllowance)
        let minerFee = fee ? fee : 154;
        let executorFee = balance - (installment + minerFee) - 1

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
    
        if(typeof(exAddress)==="string") outputs.push(
            { 
                to: exAddress,
                amount: executorFee
            })
    
        try{
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

