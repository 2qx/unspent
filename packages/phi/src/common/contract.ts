import { Artifact, Contract } from "cashscript"
import { ElectrumNetworkProvider } from 'cashscript';
import { ElectrumCluster, ClusterOrder, ElectrumTransport } from "electrum-cash"
import { deriveLockingBytecode, deriveLockingBytecodeHex  } from "./util.js";
export class BaseUtxfiContract{

    private contract: Contract
    protected testnet: boolean
    public provider: ElectrumNetworkProvider

    constructor(network :string, script:Artifact, params:any[] ) {

        if(network==="mainnet") {
            this.provider = new ElectrumNetworkProvider('mainnet');
            this.testnet = false
        }
        else if(network==="staging"){
            this.provider = new ElectrumNetworkProvider('staging') 
            this.testnet = true
        }
        else if(network==="regtest"){
            let regTest = new ElectrumCluster('utxfi-tests - faucet', '1.4.1', 1, 1, ClusterOrder.PRIORITY, 500);
            regTest.addServer('127.0.0.1', 60003, ElectrumTransport.WS.Scheme, false);
            this.provider = new ElectrumNetworkProvider("regtest",regTest, false)
            this.testnet = true
        } 
        else throw("unrecognized network")
        this.contract = new Contract(script, [...params], this.provider);
    }

    async getBalance(){
        return this.contract.getBalance()
    }

    getAddress(){
        return this.contract.address
    }

    getLockingBytecode(hex=true){
        if(hex) return deriveLockingBytecodeHex(this.contract.address)
        return deriveLockingBytecode(this.contract.address)
    }    

    getFunction(fn:string){
        return this.contract.functions[fn]    
    }

    isTestnet(){
        return this.testnet
    }
}