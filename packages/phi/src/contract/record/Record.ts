import type { Artifact } from "cashscript"
import type { TransactionDetails } from "cashscript/dist/module/interfaces"
import type { ContractOptions } from "../../common/interface.js"
import { DELIMITER, DefaultOptions } from "../../common/constant.js"
import { BaseUtxfiContract } from "../../common/contract.js"
import { artifact as v1 } from "./cash/v1.js"
import { 
    createProtocolOpReturnData, 
    hash160, 
    toHex
} from "../../common/util.js"

export class Record extends BaseUtxfiContract  {

    private static c: string = 'R';
    private static delimiter: string = DELIMITER;
    private static fn: string = "execute";


    constructor(
        public maxFee: number=850,
        public index: number=0,
        public options: ContractOptions = DefaultOptions
      ) {
        let script:Artifact
        if(options.version===1){
            script = v1         
        }else{
            throw Error("Unrecognized Divide Contract Version")
        }
        
        super(options.network!, script, [maxFee, index] );
        this.options = options
    }


    static fromString(str: string, network="mainnet"): Record {

        let comp = str.split(Record.delimiter)
        
        // if the contract shortcode doesn't match, error
        if(!(Record.c ==comp.shift())) throw("non-record (contract) serilaized string passed to record (contract) constructor")
        let version = parseInt(comp.shift()!)
    
        if(version!==1)throw Error("record contract version not recognized")
        let options = {version: version, network: network}

        
        // split off the last argument, the address pkh, save it as the checksum
        let checksum = comp.splice(-1)[0]
        
        let maxFee = parseInt(comp.shift()!)
        let index =  parseInt(comp.shift()!)
        let record = new Record(maxFee, index, options)

        // check that the address 
        if(!(checksum==record.getLockingBytecode())) throw("Divide deserializtion resulted in different contract address")
        return record
    }

    override toString(){

        return [`${Record.c}`,
               `${this.options!.version}`,
               `${this.maxFee}`,
               `${this.index}`,
               `${this.getLockingBytecode()}`].join(Record.delimiter)
    }

    toChunks() :(string)[]{
        return [
            Record.c,
            toHex(this.options!.version!),
            toHex(this.maxFee),
            toHex(this.index),
            '0x'+this.getLockingBytecode()
        ]
    }

    async info(){
        console.log(`# Recording contract with up to ${this.maxFee} per broadcast, index ${this.index} `)
        console.log('contract address:     ', this.getAddress());
        console.log('contract balance:     ', await this.getBalance());
    }
    
    async broadcast(chunks?: string[]): Promise<TransactionDetails> {
        chunks = chunks ? chunks : this.toChunks()
        let fn = this.getFunction(Record.fn)!;
        let opReturn = createProtocolOpReturnData(chunks)
        try{            
            if( typeof opReturn === "string") throw opReturn
            let checkHash = await hash160(opReturn)
                  
            let size = (await fn(checkHash)
                .withOpReturn(chunks)
                .withHardcodedFee(369)
                .build()).length;
            let txn = await fn(checkHash)
                .withOpReturn(chunks)
                .withHardcodedFee(size/2)
                .send();
            return txn
        }catch(e){
            throw(e)
        }
    }

}

