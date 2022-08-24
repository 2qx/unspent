import { binToHex, 
    cashAddressToLockingBytecode, 
    hexToBin, 
    lockingBytecodeToCashAddress
} from "@bitauth/libauth"
import { compileString } from "cashc"
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js"
import { DELIMITER, DefaultOptions, PROTOCOL_ID } from "../../common/constant.js"
import { BaseUtxPhiContract } from "../../common/contract.js"
import {  
    deriveLockingBytecodeHex,
    getPrefixFromNetwork,
    toHex,
    binToNumber } from "../../common/util.js"
import { getV1 } from "./cash/v1.js"

export class Divide extends BaseUtxPhiContract implements UtxPhiIface {

    private static c: string = 'D';
    private static delimiter: string = DELIMITER;
    private static fn: string = "execute";


    constructor(
        public executorAllowance: number=1200,
        public payees: string[],
        public options: ContractOptions = DefaultOptions
      ) {

        let scriptFn : Function;
        if(options.version===1){
              scriptFn = getV1     
        }else{
            throw Error("Unrecognized Divide Contract Version")
        }
        let divisor = payees.length
        const script = compileString(scriptFn(divisor))
        
        let payeeLocks = [... payees].map( (c) => {
            let lock = cashAddressToLockingBytecode(c)
            if(typeof(lock)==="string") throw lock
            return lock.bytecode
        })
        super(options.network!, script, [executorAllowance, divisor, ...payeeLocks] );
        this.options = options
    }


    static fromString(str: string, network="mainnet"): Divide {

        let comp = str.split(Divide.delimiter)
        
        // if the contract shortcode doesn't match, error
        if(!(Divide.c ==comp.shift())) throw("non-divide (contract) serilaized string passed to divide (contract) constructor")
        let version = parseInt(comp.shift()!)
    
        if(version!==1)throw Error("divide contract version not recognized")
        let options = {version: version, network: network}

        
        // split off the last argument, the address pkh, save it as the checksum
        let checksum = comp.splice(-1)[0]

        let prefix = getPrefixFromNetwork(options.network)

        
        let executorAllowance = parseInt(comp.shift()!)
        let payeesLocks = [... comp]
        let payees = payeesLocks.map( (lock) => {
            let addr = lockingBytecodeToCashAddress(hexToBin(lock), prefix)
            if(typeof(addr) !== "string") throw Error("non-standard address" + addr)
            return addr
        })
        let divide = new Divide(executorAllowance, payees, options)

        // check that the address 
        if(!(checksum==divide.getLockingBytecode())) throw("Divide deserializtion resulted in different contract address")
        return divide
    }



    // Create a Divide contract from an OpReturn by building a serialized string.
    static fromOpReturn(chunks:Uint8Array[], network="mainnet"): Divide {

        let protocol = "0x" + binToHex(chunks.shift()!)
        if(protocol !== PROTOCOL_ID) throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`)
        let charArray = chunks.shift()!
        let c = String.fromCharCode(charArray[0]!)!
        if(c!==this.c) throw Error(`Wrong short code passed to Divide class: ${c}`)
                
        // version
        let version = binToNumber(chunks.shift()!);
        if(version !==1) throw Error(`Wrong version code passed to Divide class: ${version}`)
        
        let options = {version: version, network: network}

        
        // split off the last argument, the address pkh, save it as the checksum
        let checksum = chunks.pop()!

        let prefix = getPrefixFromNetwork(options.network)

        
        let executorAllowance = binToNumber(chunks.shift()!);
        let payeesLocks = chunks
        let payees = payeesLocks.map( (lock) => {
            let addr = lockingBytecodeToCashAddress(lock, prefix)
            if(typeof(addr) !== "string") throw Error("non-standard address" + addr)
            return addr
            
        } )
        let divide = new Divide(executorAllowance, payees, options)

        // check that the address 
        if(!(binToHex(checksum)==divide.getLockingBytecode())) throw("Divide deserializtion resulted in different contract address")
        return divide

    }

    override toString(){

        let payees = this.payees.map( (cashaddr) => deriveLockingBytecodeHex(cashaddr)).join(Divide.delimiter)
        return [`${Divide.c}`,
               `${this.options!.version}`,
               `${this.executorAllowance}`,
               `${payees}`,
               `${this.getLockingBytecode()}`].join(Divide.delimiter)
    }

    toChunks() :(string)[]{
        return [
            PROTOCOL_ID,
            Divide.c,
            toHex(this.options!.version!),
            toHex(this.executorAllowance),
            ... this.payees.map(a => '0x'+ deriveLockingBytecodeHex(a)),
            '0x'+this.getLockingBytecode()
        ]
    }
     
    async info(){
        console.log(`# Divide contract with executor allowance of  ${this.executorAllowance}`)
        console.log(`# ${this.toString()}`)
        console.log('contract address:     ', this.getAddress());
        console.log('contract balance:     ', await this.getBalance());
        console.log('  output addresses:   ');
        for(let p of this.payees){
            console.log(`  ${p}`);
        }
    }

    async execute(exAddress?: string, fee?:number): Promise<string> {
        let fn = this.getFunction(Divide.fn)!;
        let currentValue = await this.getBalance();
        let distributedValue = currentValue-this.executorAllowance
        let divisor = this.payees.length
        let minerFee = fee ? fee : 152+ (this.payees.length*64);
        let exFee = this.executorAllowance - minerFee
        let installment = Math.round(distributedValue / divisor)+2;
        // console.log("balance       ",currentValue)
        // console.log("allowance     ",this.executorAllowance)
        // console.log("  mine fee -",minerFee)
        // console.log("  ex fee   -",exFee)
        // console.log("==================================")
        // console.log("distribution  ",distributedValue)
        // console.log("divisor       ",divisor)
        // console.log("installment     ",installment)

        if(installment<546) throw("Installment less than dust limit... bailing")

        let to:any [] = []
        for(let i=0; i<divisor; i++){
            to.push({ to: this.payees[i], amount: installment  })
          }

        if(exFee>550 && exAddress) {
        // console.log("executor fee", exFee)
        // console.log("executor exAddress", exAddress)
            
    

        }

        try{
            let test = await fn()
            .to(to)
            .withoutChange()
            .build();
            let size = test.length/2
            size
            let txn =  fn()
            .to(to)
            .withoutChange()
            .send();
            return (await txn).txid

        }catch(e){
            throw(e)
        }
    }

}

