import pgPromise from 'pg-promise';

import format from "pg-format";
import { IMain } from 'pg-promise';
import {
  decodeTransaction,
  hashTransaction,
  binToHex,
  hexToBin
} from '@bitauth/libauth';

import { INCEPTION } from './config.js';
import { getBlockHistory, getOutputs } from "./query.js";

export default class StorageProvider {

  private db;
  private pgp: IMain;
  private formatter;
  private prefix: string;
  private isInit = false;




  public constructor(prefix?: string) {
    const pgp: IMain = pgPromise({});
    this.prefix = prefix ? prefix : "unspent-cat";
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "index requires a postgres DATABASE_URL environment variable to be set"
      );
    }

    let ssl = getSslConfig();
    if (ssl) {
      //dbConfig.ssl = ssl;
    }
    this.pgp = pgPromise({/* Initialization Options */ });

    this.db = pgp(process.env.DATABASE_URL);
    this.formatter = format;
  }





  public async init(): Promise<StorageProvider> {
    if (!this.isInit) {
      this.isInit = true;
      await this.db;
      await this.formatter;

      let createOutputTable = this.formatter(
        "CREATE TABLE IF NOT EXISTS %I (" +
        "id TEXT PRIMARY KEY," +
        "height INTEGER," +
        "value INTEGER," +
        "locking_bytecode TEXT" +
        " );",
        this.prefix + "_output"
      );
      const resUtxo = await this.db.query(createOutputTable);
      resUtxo


      let createLockingBytecodeTable = this.formatter(
        "CREATE TABLE IF NOT EXISTS %I (" +
        "locking_bytecode TEXT PRIMARY KEY," +
        "version INTEGER," +
        "type text," +
        "cashaddr text," +
        "period INTEGER," +
        "allowance INTEGER," +
        "decay INTEGER" +
        " );",
        this.prefix + "_locking_bytecode"
      );

      const resLock = await this.db.query(createLockingBytecodeTable);
      resLock

      let createBlockTable = this.formatter(
        "CREATE TABLE IF NOT EXISTS %I (" +
        "height INTEGER PRIMARY KEY," +
        "timestamp TIMESTAMP" +
        " );",
        this.prefix + "_block"
      );
      const resBlocks = await this.db.query(createBlockTable);
      resBlocks


      let createFiatTable = this.formatter(
        "CREATE TABLE IF NOT EXISTS %I (" +
        "timestamp TIMESTAMP PRIMARY KEY," +
        "value decimal" +
        " );",
        this.prefix + "_fiat"
      );
      const resFiat = await this.db.query(createFiatTable);
      resFiat

    }

    return this;
  }



  public async syncBlockHistory() {
    let synced = false;
    while (!synced) {
      let tip = await this.getBlockHeight()
      tip = tip ? tip : INCEPTION
      console.log(tip)
      let blocks = await getBlockHistory(tip);
      if (blocks.length) await this.putBlockHeights(blocks);
      if (blocks.length < 1000) synced = true
    }
  }


  public async putFiatHistory(rawValues: FiatDbEntryI[]) {

    let headers = [
      'value',
      'timestamp'
    ]
    const cs = new this.pgp.helpers.ColumnSet(headers, { table: this.prefix + "_fiat" });

    // generating a multi-row insert query: 
    const query = this.pgp.helpers.insert(rawValues, cs) +
      ' ON CONFLICT(timestamp) DO UPDATE SET ' +
      cs.assignColumns({ from: 'EXCLUDED', skip: 'timestamp' });
    await this.db.none(query);
  }

  public async syncOutputHistory(lockingBytecode: string) {
    let outpoints = await getOutputs(lockingBytecode)
    console.log(outpoints)
    await this.putOutputs(outpoints)
  }

  public async getFiatCount() {
    const r = await this.db.oneOrNone(`SELECT count(*) FROM ${this.prefix + '_fiat'}`);
    return Number(r.count)
  }

  // https://stackoverflow.com/questions/37300997/multi-row-insert-with-pg-promise

  // https://vitaly-t.github.io/pg-promise/helpers.html#.insert


  public async putBlockHeights(rawValues: BlockDbEntryI[]) {

    let headers = [
      'height',
      'timestamp'
    ]
    const cs = new this.pgp.helpers.ColumnSet(headers, { table: this.prefix + "_block" });

    // generating a multi-row insert query:
    const query = this.pgp.helpers.insert(rawValues, cs) +
      ' ON CONFLICT(height) DO UPDATE SET ' +
      cs.assignColumns({ from: 'EXCLUDED', skip: 'height' });
    await this.db.none(query);
  }

  public async getBlockHeight() {
    const r = await this.db.oneOrNone(`SELECT * FROM ${this.prefix + '_block'} ORDER BY height DESC LIMIT 1`);
    if (r && r.height) return Number(r.height)
    return false
  }

  public async putTransactions(rawValues: string[]) {
    await this.putOutputs(rawValues)
    //await this.putSpends(rawValues)
  }


  public async putLockingBytecode(rawValues: PerpetuityEntryI[]) {

    let headers = [
      'locking_bytecode',
      'version',
      'type',
      'cashaddr',
      'period',
      'allowance',
      'decay'
    ]
    const cs = new this.pgp.helpers.ColumnSet(headers, { table: this.prefix + "_locking_bytecode" });
    const query = this.pgp.helpers.insert(rawValues, cs) +
    ' ON CONFLICT(id) DO UPDATE SET ' +
    cs.assignColumns({ from: 'EXCLUDED', skip: 'locking_bytecode' });
  await this.db.none(query);
  }

  public async putOutputs(rawValues: OutputEntryI[]) {



    let headers = [
      'id',
      'value',
      'height',
      'locking_bytecode'
    ]
    const cs = new this.pgp.helpers.ColumnSet(headers, { table: this.prefix + "_output" });

    const query = this.pgp.helpers.insert(rawValues, cs) +
      ' ON CONFLICT(id) DO UPDATE SET ' +
      cs.assignColumns({ from: 'EXCLUDED', skip: 'timestamp' });
    await this.db.none(query);

  }


  // public async putSpends(rawValues: string[]) {

  //   const values = rawValues.map(tx => flattenInputs(tx)).flat()
  //   let headers = [
  //     'id',
  //     'unlocking_script',
  //     'spent_hash',
  //     'spent_idx'
  //   ]
  //   const cs = new this.pgp.helpers.ColumnSet(headers, { table: this.prefix + "_output" });

  //   // generating a multi-row insert query:
  //   const query = this.pgp.helpers.insert(values, cs);
  //   await this.db.none(query);
  // }

  public async getCount() {
    const r = await this.db.oneOrNone(`SELECT count(*) FROM ${this.prefix + '_output'}`);
    return Number(r.count)
  }

  public async getOutputs(key: any) {
    return (await this.db.one(`SELECT * FROM ${this.prefix + "_output"} WHERE locking_bytecode like '${key}%'`))
  }



}


export function flattenOutputs(txHex: string): any[] {

  const tx = decodeTransaction(hexToBin(txHex))
  let hash = hashTransaction(hexToBin(txHex))
  if (typeof tx === "string") throw (tx)
  return tx.outputs.map((o, idx) => {
    return {
      'id': hash + ':' + idx,
      'locking_bytecode': binToHex(o.lockingBytecode),
      'value': Number(o.valueSatoshis)
    }
  })
}


export function flattenInputs(txHex: string): any[] {

  const tx = decodeTransaction(hexToBin(txHex))
  let hash = hashTransaction(hexToBin(txHex))
  if (typeof tx === "string") throw (tx)
  return tx.inputs.map((i, idx) => {
    return {
      'id': binToHex(i.outpointTransactionHash) + ':' + i.outpointIndex,
      'hash': binToHex(i.outpointTransactionHash),
      'idx': i.outpointIndex,
      'unlocking_script': binToHex(i.unlockingBytecode),
      'spent_hash': hash,
      'spent_idx': idx,
    }
  })
}

export interface ScriptDbEntryI {
  id?: string;
  hash: string;
  idx: number;
  value: number;
  locking_bytecode: string;
  unlockingBytecode: string;
  outpoint_hash: string;
  outpoint_idx: number;
  outpoint_height: number;
}

export interface BlockDbEntryI {
  height?: number;
  timestamp: Date;
}


export interface PerpetuityEntryI {
  locking_bytecode: string,
  version: number,
  type: string,
  cashaddr: string,
  period: number,
  allowance: number,
  decay: number
}

export interface OutputEntryI {
  id: string,
  value: number,
  height: number,
  locking_bytecode: string,
}

export interface FiatDbEntryI {
  value: number;
  t: Date;
}

export interface sslConfigI {
  rejectUnauthorized: boolean;
  ca?: string;
  key?: string;
  cert?: string;
}

export function getSslConfig(): sslConfigI | undefined {
  const ca = process.env.DATABASE_SSL_CA
    ? Buffer.from(process.env.DATABASE_SSL_CA, "base64").toString("ascii")
    : undefined;
  const key = process.env.DATABASE_SSL_KEY
    ? Buffer.from(process.env.DATABASE_SSL_KEY, "base64").toString("ascii")
    : undefined;
  const cert = process.env.DATABASE_SSL_CERT
    ? Buffer.from(process.env.DATABASE_SSL_CERT, "base64").toString("ascii")
    : undefined;
  let ssl: sslConfigI = {
    rejectUnauthorized:
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED == "false" ? false : true,
    ca: ca,
    key: key,
    cert: cert,
  };
  if (ssl.ca || ssl.cert || ssl.key) {
    return ssl;
  } else {
    return;
  }
}
