import {
  Sha256,
  decodeTransaction,
  hexToBin,
  binToBigIntUint64LE
} from '@bitauth/libauth';
import { default as Dexie } from "dexie";
import { Table } from "dexie";

import {
  BlockI,
  ContractI,
  PsiOutpointI,
} from "./interface.js";

// No network fallbacks to ElectrumX nor Chaingraph should be imported here
// This class deals strictly with putting data into and getting it out of the database.
import {
  BytecodePatternQueryI,
  BytecodePatternExtendedQueryI, 
  HistoryI,
  parseOpReturn,
  prepareBytecodeQueryParameters
} from "@unspent/phi";
import { binToHex } from "@bitauth/libauth";


export class Psi
  extends Dexie {

  public contract!: Table<ContractI, string>; // an unspent phi contract record

  public utxo!: Table<PsiOutpointI, string>;

  public block!: Table<BlockI, number>; // block by number index

  public constructor(
    public name: string
  ) {
    super(name);
    this.version(1).stores({
      block: 'id,timestamp',
      contract: 'id,height,data.address,data.code,data.options',
      utxo: 'id,lockingBytecode,[lockingBytecode+state]',
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
    const lastBlock = await this.block
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


  public rawToTransactionI(raw: string | Uint8Array, sha256: Sha256) {
    raw = typeof raw === "string" ? hexToBin(raw) : raw
    const hash = binToHex(sha256.hash(sha256.hash(raw)).reverse())
    const transaction = decodeTransaction(raw)
    if (typeof transaction === "string") throw (Error(transaction))
    return {
      id: hash,
      raw: binToHex(raw),
      ...transaction,
      spends: transaction.inputs.map(i => i.outpointTransactionHash + ":" + i.outpointIndex),
      locks: transaction.outputs.map(o => binToHex(o.lockingBytecode))
      // height
    }
  }



  public async bulkPutRawTransaction(transactionObjects: HistoryI[], lockingBytecode: string) {
    const outputs = this.mapOutputsFromTransactionHistory(transactionObjects, lockingBytecode)
    const updates = this.mapOutputUpdatesFromTransactionHistory(transactionObjects)

    // put outputs
    await this.utxo.bulkPut(outputs)
      .catch('DatabaseClosedError', e => {
        // user is in private mode?
        e
      })

    // put outputs
    await this.utxo.bulkUpdate(updates)
    .catch('DatabaseClosedError', e => {
      // user is in private mode?
      e
    })

    return outputs
  }


  protected mapOutputsFromTransactionHistory(transactionObjects: HistoryI[], lockingBytecode: string) {
    let utxos = transactionObjects
      .map((tx) => {
        const raw = typeof tx.raw === "string" ? hexToBin(tx.raw) : tx.raw
        const transaction = decodeTransaction(raw)
        if (typeof transaction === "string") throw (Error(transaction))
        return transaction
          .outputs
          .map((o, idx) => {
            return {
              id: tx.hash + ":" + idx,
              lockingBytecode: binToHex(o.lockingBytecode),
              value: Number(binToBigIntUint64LE(o.satoshis)),
              state: !Array.isArray(tx.spentBy) || !tx.spentBy.length ? "UTXO" : "STXO",
              debounce: new Date().getTime(),
              height: tx.height,
              locktime: transaction.locktime,
              version: transaction.version
            }
          })
          .filter(o => { return (o.lockingBytecode === lockingBytecode && o.state === "UTXO")})
          
      })
      .flatMap(o => o)
      return utxos
  }


  protected mapOutputUpdatesFromTransactionHistory(transactionObjects: HistoryI[]) {
    return transactionObjects
      .map((tx) => {
        const raw = typeof tx.raw === "string" ? hexToBin(tx.raw) : tx.raw
        const transaction = decodeTransaction(raw)
        if (typeof transaction === "string") throw (Error(transaction))
        // One outpoint can have multiple inputs
        // collect them on a map per outpoint
        return transaction
          .inputs
          .map((i) => {
            const outpoint = binToHex(i.outpointTransactionHash) + ":" + i.outpointIndex
            return {
              key: outpoint,
              changes: {
                state: "STXO"
              }
            }
          })
      })
      .flatMap(o => o)
  }




  public async putUnspentPhiContractFromSerial(opReturn: Uint8Array | string, height?: number) {

    const contract = parseOpReturn(opReturn)
    const data = { ...contract, ... { "lockingBytecode": binToHex(contract.lockingBytecode) } }

    if (typeof opReturn !== "string") opReturn = binToHex(opReturn);
    await this.contract.put(
      {
        "id": opReturn,
        "data": data,
        "height": height
      },
      opReturn
    ).catch('DatabaseClosedError', e => {
      // user is in private mode
      e
    }) // or throw
  }

  public async bulkPutUnspentPhiContracts(opReturns: ContractI[]) {

    await this.contract.bulkPut(opReturns)
      .catch('DatabaseClosedError', e => {
        // user is in private mode
        e
      }) // or throw

  }

  public async getUnspentPhiContracts(param: BytecodePatternQueryI | BytecodePatternExtendedQueryI ): Promise<ContractI[]> {

    param = prepareBytecodeQueryParameters(param)
    
    return this.contract
      .where("id").startsWith(param.prefix!)
      .offset(param.offset ? param.offset : 0) // offset MUST come before limit
      .limit(param.limit ? param.limit : 25)
      .toArray()
      .catch('DatabaseClosedError', e => {
        // user is in private mode
        e
        return []
      })
  }

  public async getUtxosByLockingBytecode(lockingBytecode: Uint8Array | string): Promise<PsiOutpointI[]> {

    if (typeof lockingBytecode !== "string") lockingBytecode = binToHex(lockingBytecode)
    let utxos = (await this.utxo
      .where({ lockingBytecode: lockingBytecode, state: "UTXO" })
      .toArray()
      .catch('DatabaseClosedError', e => {
        // user is in private mode
        e
        return []
      })
    )
    return utxos

  }



}

