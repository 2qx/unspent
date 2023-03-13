import { default as Dexie } from "dexie";
import { Table } from "dexie";

import {
  BlockI,
  ContractI,
  BytecodePatternQueryI,
  OutpointDetailsI,
  PsiUtxoI,
  TransactionI,
  ChaingraphSearchOutputPrefixResponse,
  OpReturnRecords,
  ChaingraphSearchOutputResult
} from "./interface.js";
import { parseOpReturn } from "@unspent/phi";
import { binToHex } from "@bitauth/libauth";


export class Psi
  extends Dexie {

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
      contract: 'id,data.address,data.code,data.options,height',
      outpoint: 'id,data.lockingBytecode,[data.tx_hash+data.tx_pos],data.height',
      // "transaction" conflicts with Dexie base class
      tx: 'id,raw'
    });
  }


  public async setBlockHeight(height: number): Promise<void> {
    await this.block.put({
      id: height,
      timestamp: new Date()
    }).catch(function (error) {
      // Log or display the error
      console.error(error.stack || error);
    });
  }

  public async getBlockHeight(): Promise<BlockI> {
    let lastBlock = await this.block
      .orderBy('timestamp')
      .last()
      .catch('DatabaseClosedError', e => {
        // user is in private mode
        e
      })
      .catch(function (error) {
        // Log or display the error
        console.error(error.stack || error);
      });
    // -1 is no blockheight
    return lastBlock ? lastBlock : { id: -1, timestamp: new Date() }
  }

  public async addUnspentPhiContract(opReturn: Uint8Array | string, height?: number) {

    let contract = parseOpReturn(opReturn)
    if (typeof opReturn !== "string") opReturn = binToHex(opReturn);
    await this.contract.add({
      "id": opReturn,
      "data": contract,
      "height": height
    }).catch('DatabaseClosedError', e => {
      // user is in private mode
      e
    }).catch(function (error) {
      // Log or display the error
      console.error(error.stack || error);
    });
  }

  public async bulkPutUnspentPhiContracts(opReturns: OpReturnRecords[]) {
    let contracts = opReturns.map((o) => {
      return {
        "id": o.record,
        "data": parseOpReturn(o.record),
        "height": o.height
      }
    })
    await this.contract.bulkPut(contracts)
      .catch('DatabaseClosedError', e => {
        // user is in private mode
        e
      })
      .catch(function (error) {
        // Log or display the error
        console.error(error.stack || error);
      });
  }

  public async bulkPutSearchOutputPrefix(results: ChaingraphSearchOutputPrefixResponse) {
    let records = results.search_output_prefix.map((r: ChaingraphSearchOutputResult) => {

      let height = r.transaction.block_inclusions[0]?.block.height
      if (typeof height === "string") height = parseInt(height)
      if (r.locking_bytecode.slice(0, 2) === "\\x") {
        return {
          record: r.locking_bytecode.slice(2),
          height: height
        }
      } else {
        return {
          record: r.locking_bytecode.slice(2),
          height: height
        }
      }
    })
    await this.bulkPutUnspentPhiContracts(records)
  }




  public async getUnspentPhi(param: BytecodePatternQueryI): Promise<ContractI[]> {

    return this.contract
      .where("id").startsWith(param.prefix)
      // .filter(function (contract) {
      //   return param.node ? contract.data.options.network === param.node : true;
      // })
      .offset(param.offset ? param.offset : 0) // offset MUST come before limit
      .limit(param.limit ? param.limit : 25)
      .toArray()
      .catch('DatabaseClosedError', e => {
        // user is in private mode
        e
        return []
      })
      .catch(function (error) {
        // Log or display the error
        console.error(error.stack || error);
        return []
      });;
  }



  public async addUtxo(data: OutpointDetailsI, lockingBytecode: Uint8Array) {

    data.lockingBytecode = lockingBytecode

    await this.outpoint.add({
      "id": data.tx_hash + ":" + data.tx_pos,
      "data": data
    })
      .catch('DatabaseClosedError', e => {
        // user is in private mode
        e
      })
      .catch(function (error) {
        console.error(error.stack || error);
      });
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
      .catch('DatabaseClosedError', e => {
        // user is in private mode
        e
        return []
      })
      .catch(function (error) {
        console.error(error.stack || error);
        return []
      });
  }

  public async getUtxosByLockingBytecode(lockingBytecode: Uint8Array): Promise<PsiUtxoI[]> {
    return this.outpoint
      .where("data.lockingBytecode").equals(lockingBytecode)
      .toArray()
      .catch('DatabaseClosedError', e => {
        // user is in private mode
        e
        return []
      })
      .catch(function (error) {
        // Log or display the error
        console.error(error.stack || error);
        return []
      });;
  }

}


