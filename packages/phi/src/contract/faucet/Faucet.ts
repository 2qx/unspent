import type { Artifact } from "cashscript"
import type { UtxfiContract, ContractOptions }  from "../../common/interface.js"
import { binToHex } from "@bitauth/libauth"
import { DELIMITER, DefaultOptions, PROTOCOL_ID } from "../../common/constant.js"
import { BaseUtxfiContract } from "../../common/contract.js"
import { toHex, binToNumber } from "../../common/util.js"
import { artifact as v1 } from "./cash/v1.js"


export class Faucet extends BaseUtxfiContract implements UtxfiContract {

    private static c: string = 'F'; 
    private static delimiter: string = DELIMITER;
    private static fn: string = "drip";


    constructor(
        public period: number = 1,
        public payout: number = 1000,
        public index: number = 1,
        public options: ContractOptions = DefaultOptions
      ) {
        let script:Artifact
        if(options.version===1){
              script = v1     
        }else{
            throw Error("Unrecognized Faucet Version")
        }
        super(options.network!, script, [period, payout, index] );
        this.options = options
    }


    static fromString(str: string, network="mainnet"): Faucet {
        let comp = str.split(Faucet.delimiter)
        
        // if the contract shortcode doesn't match, error
        if(!(Faucet.c ==comp.shift())) throw("non-faucet serilaized string passed to faucet constructor")

        let version = parseInt(comp.shift()!)

        // split off the last argument, the address pkh, save it as the checksum
        let checksum = comp.splice(-1)[0]


        let [period, payout, index] = [1, 1000, 1]
        if(version==1){
            period = parseInt(comp.shift()!)
            payout = parseInt(comp.shift()!)
            index = parseInt(comp.shift()!)
        }else{
            throw Error("faucet contract version not recognized")
        }
        let options = {version: version, network: network }
        let faucet = new Faucet(period, payout, index, options)
        
        // check that the address 
        if(!(checksum==faucet.getLockingBytecode())) throw("faucet deserializtion resulted in different contract address")
        return faucet
    }


    // Create a Faucet contract from an OpReturn by building a serialized string.
    static fromOpReturn(chunks:Uint8Array[], network="mainnet"): Faucet {

        let protocol = "0x"+ binToHex(chunks.shift()!)
        if(protocol !== PROTOCOL_ID) throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`)
        let charArray = chunks.shift()!
        let c = String.fromCharCode(charArray[0]!)!
        if(c!==this.c) throw Error(`Wrong short code passed to Faucet class: ${c}`)
                
        // version
        let version = binToNumber(chunks.shift()!);
        if(version !==1) throw Error(`Wrong version code passed to Annuity class: ${version}`)
        let options = {version: version, network: network}

        // split off the last argument, the address pkh, save it as the checksum
        let checksum = chunks.pop()!

        let [period, payout, index] = [4000, 120, 1]
        if(version==1){
            period = binToNumber(chunks.shift()!)
            payout = binToNumber(chunks.shift()!)
            index = binToNumber(chunks.shift()!)   
        }else{
            throw Error("faucet contract version not recognized")
        }

        let faucet = new Faucet(period, payout, index, options)
        
        // check that the address 
        if(!(binToHex(checksum)==faucet.getLockingBytecode())) throw("Faucet deserializtion resulted in different contract public key hash")
        return faucet
    }

    override toString(){
        return [`${Faucet.c}`,
               `${this.options!.version}`,
               `${this.period}`,
               `${this.payout}`,
               `${this.index}`,
               `${this.getLockingBytecode()}`].join(Faucet.delimiter)
    }

    toChunks(): string[]{
        return [PROTOCOL_ID,
               Faucet.c,
               toHex(this.options!.version!),
               toHex(this.period),
               toHex(this.payout),
               toHex(this.index),
               '0x'+this.getLockingBytecode()]
    }

    async info(){
        console.log(`# A faucet paying ${this.payout} (sat), every ${this.period} blocks, `)
        console.log('# ',this.toString());
        console.log('contract address:          ', this.getAddress());
        console.log("contract principal:        ", await this.getBalance());
    }

    async execute(exAddress?: string, fee?:number): Promise<string> {
        let balance = await this.getBalance();
        let fn = this.getFunction(Faucet.fn)!;
        let newPrincipal = balance - this.payout
        let minerFee = fee ? fee : 152;
        let sendAmout = this.payout - minerFee

        let to = [
            {
                to: this.getAddress(),
                amount: newPrincipal,
            }
            ]

        if(exAddress) to.push(
            { 
                to: exAddress,
                amount: sendAmout
            })

        try{
            let payTx = await fn()
            .to(to)
            .withAge(this.period)
            .withoutChange()
            .send();
            return payTx.txid
        }catch(e){
            throw(e)
        }
    }

}

