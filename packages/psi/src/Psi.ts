import { default as Dexie } from "dexie";
import { Table } from "dexie";

import {
  BlockI,
  ContractI,
  BytecodePatternQueryI,
  OutpointDetailsI,
  PsiUtxoI,
  TransactionI
} from "./interface.js";
import { parseOpReturn } from "@unspent/phi";
import { binToHex } from "@bitauth/libauth";


export class Psi
  extends Dexie
   {

  public contract!: Table<ContractI, string>; // an unspent phi contract record
  public outpoint!: Table<PsiUtxoI, string>; // a UTXO with extra stuff for queries

  // The name "transaction" conflicts with the base class
  public txn!: Table<TransactionI, string> // raw transactions
  public block!: Table<BlockI, number>; // block by number index

  public constructor(
    public name: string
  ) {
    super(name);
    this.version(1).stores({
      block: 'id,timestamp',
      contract: 'id,data.address,data.code,data.options',
      outpoint: 'id,data.lockingBytecode,[data.tx_hash+data.tx_pos],data.height',
      // "transaction" conflicts with base class
      txn: 'id,raw'
    });
  }




  public async setBlockHeight(height: number): Promise<void> {

    await this.block.add({
      id: height,
      timestamp: new Date()
    })

  }

  public async addUnspentPhi(opReturn: Uint8Array | string) {

    let contract = parseOpReturn(opReturn)
    if (typeof opReturn !== "string") {
      opReturn = binToHex(opReturn);
    }
    await this.contract.add({
      "id": opReturn,
      "data": contract
    })
  }

  public async bulkPutUnspentPhi(opReturns: string[]) {
    let contracts = opReturns.map((o) => {
      return {
        "id": o,
        "data": parseOpReturn(o)
      }
    })
    await this.contract.bulkPut(contracts)
  }


  public async getUnspentPhi(param: BytecodePatternQueryI) {

    return this.contract
      .where("id").startsWith(param.prefix)
      .filter(function (contract) {
        return param.node ? contract.data.options.network === param.node : true;
      })
      .limit(param.limit ? param.limit : 25)
      .offset(param.offset ? param.offset : 0)
      .toArray();
  }



  public async addUtxo(data: OutpointDetailsI, lockingBytecode: Uint8Array) {

    data.lockingBytecode = lockingBytecode

    await this.outpoint.add({
      "id": data.tx_hash + ":" + data.tx_pos,
      "data": data
    })
  }

  public async bulkPutUtxo(outpoints: OutpointDetailsI[], lockingBytecode: Uint8Array) {
    let utxoData = outpoints.map((data) => {
      data.lockingBytecode = lockingBytecode
      return {
        "id": data.tx_hash + ":" + data.tx_pos,
        "data": data
      }
    })
    await this.outpoint.bulkPut(utxoData)
  }

  public async getUtxosByLockingBytecode(lockingBytecode: Uint8Array): Promise<PsiUtxoI[]> {

    return this.outpoint
      .where("data.lockingBytecode").equals(lockingBytecode)
      .toArray();
  }

  


  
}


