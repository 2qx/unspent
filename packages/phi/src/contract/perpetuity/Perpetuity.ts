import { 
    cashAddressToLockingBytecode,
    hexToBin,
    lockingBytecodeToCashAddress } from "@bitauth/libauth"
import type { Artifact } from "cashscript"
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js"
import { DefaultOptions,  _PROTOCOL_ID } from "../../common/constant.js"
import { BaseUtxPhiContract } from "../../common/contract.js"
import { binToNumber,  
    deriveLockingBytecodeHex,
    getPrefixFromNetwork, toHex } from "../../common/util.js"
import { artifact as v1 } from "./cash/v1.js"


export class Perpetuity extends BaseUtxPhiContract implements UtxPhiIface {

    public static c: string = "P"; 
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

        let p = this.parseSerializedString(str, network)
        
        // if the contract shortcode doesn't match, error
        if(!(this.c ==p.code)) throw(`non-${this.name} serilaized string passed to ${this.name} constructor`)

        if(p.options.version!=1) throw Error(`${this.name} contract version not recognized`)
        if(p.args.length != 4) throw(`invalid number of arguments ${p.args.length}`)
        
        const period = parseInt(p.args.shift()!)    

        const lock = p.args.shift()!

        const prefix = getPrefixFromNetwork(network)
        const address = lockingBytecodeToCashAddress(hexToBin(lock), prefix)
        if(typeof(address) !== "string") throw Error("non-standard address" + address)
        
        const executorAllowance = parseInt(p.args.shift()!)
        const decay = parseInt(p.args.shift()!)

        let perpetuity = new Perpetuity(period, address, executorAllowance, decay, p.options)

        // check that the address 
        perpetuity.checkLockingBytecode(p.lockingBytecode)
        return perpetuity
    }

    // Create a Perpetuity contract from an OpReturn by building a serialized string.
    static fromOpReturn(opReturn:Uint8Array|string, network="mainnet"): Perpetuity {

        let p = this.parseOpReturn(opReturn, network)
        
        // check code
        if(p.code!==this.c) throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`)
        
        // version
        if(p.options.version !==1) throw Error(`Wrong version code passed to ${this.name} class: ${p.options.version}`)
       

        let period = binToNumber(p.args.shift()!)
        let lock = p.args.shift()!

        let prefix = getPrefixFromNetwork(network)
        let address = lockingBytecodeToCashAddress(lock, prefix)
        if(typeof(address) !== "string") throw Error("non-standard address" + address)

        const executorAllowance = binToNumber(p.args.shift()!)
        const decay = binToNumber(p.args.shift()!)
       
        let perpetuity = new Perpetuity(period, address, executorAllowance, decay, p.options)
        
        // check that the address 
        perpetuity.checkLockingBytecode(p.lockingBytecode)
        return perpetuity
    }

    override toString(){
        return [`${Perpetuity.c}`,
               `${this.options!.version}`,
               `${this.period}`,
               `${deriveLockingBytecodeHex(this.address)}`,
               `${this.executorAllowance}`,
               `${this.decay}`,
               `${this.getLockingBytecode()}`].join(Perpetuity.delimiter)
    }

    override asText():string{
        return `Perpetuity to pay 1/${this.decay} the input, every ${this.period} blocks, after a ${this.executorAllowance} (sat) executor allowance`
    }

    toOpReturn(hex=false): string | Uint8Array {
        const chunks = [
            Perpetuity._PROTOCOL_ID,
            Perpetuity.c,
            toHex(this.options!.version!),
            toHex(this.period),
            '0x'+ deriveLockingBytecodeHex(this.address),
            toHex(this.executorAllowance),
            toHex(this.decay),
            '0x'+ this.getLockingBytecode()
        ]
        return this.asOpReturn(chunks, hex)
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

