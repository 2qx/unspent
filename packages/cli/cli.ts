#!/usr/bin/env -S npx ts-node --esm tsconfig.json

import {Cli, Command, Builtins, Option} from 'clipanion';
import { Divide, Faucet, Perpetuity, Record } from '@unspent/phi';

class DivideCommand extends Command {
  static paths = [[`divide`], [`d`]];

  isTestnet = Option.Boolean('--testnet',false )
  isRegtest = Option.Boolean('--regtest',false )

  allowance = Option.String('--allowance', {required: false, description: "the executor's allowance for miner fees & adminstration (default: 3400 sats)"});
  addresses = Option.String('--addresses', {required: true, description: "a comma seperated list of addresses to recieve equal payments"});
  fee = Option.String('--fee', {required: false, description: "a custom fee"});
  executorAddress = Option.String('--exAddress', {required: false, description: "address for fee taken by executor for submitting transaction"});
  
  async execute() {
    let network = this.isTestnet ? "staging": this.isRegtest ? "regtest": "mainnet"
    let allowanceInt = !this.allowance ? undefined: parseInt(this.allowance) ;
    let addresses = this.addresses.split(",");
    let feeOverride = !this.fee ? undefined : parseInt(this.fee) ;
    let divide = new Divide(allowanceInt, addresses, {version:1, network:network})
    if(await divide.getBalance()>(addresses.length*550)){
      let response = await divide.execute(this.executorAddress, feeOverride)
      console.log(response)
    }else{
      divide.info()
    }
   
  }
}


class FaucetCommand extends Command {
    static paths = [[`faucet`], [`f`]];
    isTestnet = Option.Boolean('--testnet',false )
    isRegtest = Option.Boolean('--regtest',false )

    address = Option.String('--address', {required: false, description: "receiving address to send coins to, i.e. your address"});
    fee = Option.String('--fee', {required: false, description: "a custom fee, if mutliple inputs"});
    period = Option.String('--period', {required: false, description: "how often (in blocks) the contract can pay"});
    payout = Option.String('--payout', {required: false, description: "how much the contract pays (satoshi)"});
    index = Option.String('--index', {required: false, description: "a nonce to force uniqueness with identical parameters"});
  
    async execute() {
      let network = this.isTestnet ? "staging": this.isRegtest ? "regtest": "mainnet"
      let periodInt = !this.period ? 1: parseInt(this.period) ;
      let payoutInt = !this.payout ? 1000: parseInt(this.payout) ;
      let indexInt = !this.index ? 1: parseInt(this.index) ;
      let feeOverride = !this.fee ? undefined : parseInt(this.fee) ;
      if(this.address){
        let faucet = new Faucet(periodInt, payoutInt, indexInt, {version:1, network:network})
        let response = await faucet.execute(this.address, feeOverride)
        console.log(response)
      }else{
        let faucet =  await new Faucet(periodInt, payoutInt, indexInt, {version:1, network:network})
        faucet.info()
      }
    }
}

class PerpetuityCommand extends Command {
    static paths = [[`perpetuity`], [`p`]];
  
  
    isTestnet = Option.Boolean('--testnet',false, {description: "Use testnet, defaults to 12.5% each block"})
    isRegtest = Option.Boolean('--regtest',false )

    getAddress = Option.Boolean('--deposit',false, {description: "give the deposit address for the contract and exit"} )
  
    address = Option.String('--address', {required: true, description: "recieving cash address to send coins to, i.e. beneficiary address"});
    period = Option.String('--period', {required: false, description: "how often (in blocks) the contract pays (default: 4000, about monthly)"});
    allowance = Option.String('--allowance', {required: false, description: "the executor's allowance for miner fees & adminstration (default: 3400 sats)"});
    decay = Option.String('--decay', {required: false, description: "the divisor for the fraction taking in each installment (default: 120, i.e. 1/120 or 0.83% each installment)"});
    executorAddress = Option.String('--exAddress', {required: false, description: "address for fee taken by executor for submitting transaction"});
    fee = Option.String('--fee', {required: false, description: "transaction fee override"});
  
    async execute() {

      let network = this.isTestnet ? "staging": this.isRegtest ? "regtest": "mainnet"
      const defaultPeriod = this.isTestnet ? 1 : 4000;
      const defaultDecay = this.isTestnet ? 8 : 120;
      let periodInt = !this.period ? defaultPeriod : parseInt(this.period) ;
      let allowanceInt = !this.allowance ? 3400: parseInt(this.allowance) ;
      let decayInt = !this.decay ? defaultDecay: parseInt(this.decay) ;
      let feeOverride = !this.fee ? undefined : parseInt(this.fee) ;
  
  
      if(!this.getAddress){
         let perp =  new Perpetuity( periodInt, this.address, allowanceInt, decayInt,  {version:1, network:network} )
         await perp.info()
         perp.execute(this.executorAddress, feeOverride)
      }else{
        let perp =  new Perpetuity( periodInt, this.address, allowanceInt, decayInt,  {version:1, network:network} )
        await perp.info()
      }
    }
  }

  class RecordCommand extends Command {
    static paths = [[`record`], [`r`]];
  
  
    isTestnet = Option.Boolean('--testnet',false, {description: "Use testnet"})
    isRegtest = Option.Boolean('--regtest',false )
    
    maxFee = Option.String('--maxFee', {required: false, description: "transaction miner fee available to publish contracts"});
    index = Option.String('--index', {required: false, description: "a nonce to force uniqueness with identical parameters"});
    contract = Option.String('--contract', {required: false, description: "a serialized contract to publish"});
    
    
    async execute() {

      let network = this.isTestnet ? "staging": this.isRegtest ? "regtest": "mainnet"
      let maxFeeInt = !this.maxFee ? undefined: parseInt(this.maxFee) ;
      let indexInt = !this.index ? undefined: parseInt(this.index) ;

  
  
      if(!this.contract){
         let r =  new Record( maxFeeInt, indexInt,  {version:1, network:network} )
         r.info()
      }else{
        let r =  new Record( maxFeeInt, indexInt,  {version:1, network:network} )
        let details = await r.broadcast()
        console.log(details)
      }
    }
  }

const cli = new Cli({
    binaryName: '@unspent/cli',
    binaryLabel: '@unspent/cli',
    binaryVersion: '0.0.1'
});

cli.register(DivideCommand);
cli.register(FaucetCommand);
cli.register(PerpetuityCommand);
cli.register(RecordCommand);
cli.register(Builtins.VersionCommand);
cli.register(Builtins.HelpCommand);
cli.runExit(process.argv.slice(2));