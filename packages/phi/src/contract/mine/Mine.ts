import { binToHex, hexToBin, bigIntToBinUintLE } from "@bitauth/libauth"
import type { Artifact } from "cashscript"
import type { UtxfiContract, ContractOptions }  from "../../common/interface.js"
import { DELIMITER, DefaultOptions, PROTOCOL_ID } from "../../common/constant.js"
import { BaseUtxfiContract } from "../../common/contract.js"
import { toHex, binToNumber, sha256, getRandomIntWeak, sum } from "../../common/util.js"
import { artifact as v1 } from "./cash/v1.js"



export class Mine extends BaseUtxfiContract implements UtxfiContract {

    private static c: string = 'M';
    private static delimiter: string = DELIMITER;
    private static fn: string = "execute";


    constructor(
        public period: number = 1,
        public payout: number = 5000,
        public difficulty: number = 3,
        public canary: Uint8Array = new Uint8Array(7),
        public options: ContractOptions = DefaultOptions
      ) {
        let script:Artifact
        if(options.version===1){
            script = v1       
        }else{
            throw Error(`Unrecognized Mine Contract Version`)
        }
        super(options.network!, script, [period, payout, difficulty, canary] );
        this.options = options
    }


    static fromString(str: string, network="mainnet"): Mine {
        let comp = str.split(this.delimiter)
        
        // if the contract shortcode doesn't match, error
        if(!(this.c ==comp.shift())) throw("non-mine serilaized string passed to mine constructor")

        let version = parseInt(comp.shift()!)

        // split off the last argument, the address pkh, save it as the checksum
        let checksum = comp.splice(-1)[0]


        let [period, payout, difficulty, canary] = [5000, 120, 1, new Uint8Array(7)]
        if(version==1){
            period = parseInt(comp.shift()!)
            payout = parseInt(comp.shift()!)
            difficulty = parseInt(comp.shift()!)
            canary = hexToBin(comp.shift()!)
        }else{
            throw Error("mine contract version not recognized")
        }
        let options = {version: version, network: network }
        let mine = new Mine(period, payout, difficulty, canary, options)
        
        // check that the address 
        if(!(checksum==mine.getLockingBytecode())) throw("mine deserializtion resulted in different contract address")
        return mine
    }


    // Create a Mine contract from an OpReturn by building a serialized string.
    static fromOpReturn(chunks:Uint8Array[], network="mainnet"): Mine {

        let protocol = "0x"+ binToHex(chunks.shift()!)
        if(protocol !== PROTOCOL_ID) throw Error(`Protocol specified in OpReturn didn't match the PROTOCOL_ID: ${protocol} v ${PROTOCOL_ID}`)
        let charArray = chunks.shift()!
        let c = String.fromCharCode(charArray[0]!)!
        if(c!==Mine.c) throw Error(`Wrong short code passed to Mine class: ${c}`)
                
        // version
        let version = binToNumber(chunks.shift()!);
        if(version !==1) throw Error(`Wrong version code passed to Mine class: ${version}`)
        let options = {version: version, network: network}

        // split off the last argument, the address pkh, save it as the checksum
        let checksum = chunks.pop()!

        let [period, payout, difficulty, canary] = [4000, 120, 1, new Uint8Array(7)]
        if(version==1){
            period = binToNumber(chunks.shift()!)
            payout = binToNumber(chunks.shift()!)
            difficulty = binToNumber(chunks.shift()!)   
            canary = chunks.shift()! 
        }else{
            throw Error("mine contract version not recognized")
        }

        let mine = new Mine(period, payout, difficulty, canary, options)
        
        // check that the address 
        if(!(binToHex(checksum)==mine.getLockingBytecode())) throw("Mine deserializtion resulted in different contract locking code")
        return mine
    }

    override toString(){
        return [`${Mine.c}`,
               `${this.options!.version}`,
               `${this.period}`,
               `${this.payout}`,
               `${this.difficulty}`,
               binToHex(this.canary),
               `${this.getLockingBytecode()}`].join(Mine.delimiter)
    }

    toChunks(): string[]{
        return [PROTOCOL_ID,
               Mine.c,
               toHex(this.options!.version!),
               toHex(this.period),
               toHex(this.payout),
               toHex(this.difficulty),
               '0x'+binToHex(this.canary),
               '0x'+this.getLockingBytecode()]
    }

    async info(){
        console.log(`# A mine, with difficulty ${this.difficulty} paying ${this.payout} (sat), every ${this.period} blocks, `)
        console.log('# ',this.toString());
        console.log('contract address:          ', this.getAddress());
        console.log("contract principal:        ", await this.getBalance());
    }

    async getNonce(): Promise<Uint8Array>{
        let nonce = new Uint8Array([])
        let result = new Uint8Array([])
        let mined = false
        while(!mined){
            let nonceNumber = getRandomIntWeak(9007199254740991)
            nonce = bigIntToBinUintLE(BigInt(nonceNumber))
            let msg = new Uint8Array([...hexToBin(this.getRedeemScriptHex()), ...nonce])
            result = await sha256(msg)
            if(result.slice(0,this.difficulty).reduce(sum) === 0) mined = true
        }
        return nonce
    }

    async execute(exAddress?: string, fee?:number): Promise<string> {
        let balance = await this.getBalance();
        let fn = this.getFunction(Mine.fn)!;
        let newPrincipal = balance - this.payout
        let minerFee = fee ? fee : 400;
        let reward = this.payout - minerFee

        this.canary = await this.getNonce()
        

        let nextContract = new Mine(this.period, this.payout, this.difficulty, this.canary, this.options)
        let chunks = nextContract.toChunks()


        let to = [
            {
                to: nextContract.getAddress(),
                amount: newPrincipal,
            }
            ]

        if(exAddress) to.push(
            { 
                to: exAddress,
                amount: reward
            })

        let canaryHex = '0x'+binToHex(this.canary)
                
        try{
            let size = await fn(canaryHex)
            .withOpReturn(chunks)
            .to(to)
            .withAge(this.period)
            .withHardcodedFee(minerFee)
            .build();
            
            if(exAddress){
                let minerFee = fee ? fee : size.length/2;
                let reward = this.payout - (minerFee+4)
                to.pop();
                to.push(
                    { 
                        to: exAddress,
                        amount: reward
                    })
            } 

            let payTx = await fn(canaryHex)
            .withOpReturn(chunks)
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

