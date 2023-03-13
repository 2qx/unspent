import { Network, NetworkProvider } from "cashscript";
import { getChaingraphUnspentRecords, deriveLockingBytecode } from "@unspent/phi"
import {
  BytecodePatternQueryI,
  OutpointDetailsI,
  PsiUtxoI,
  Utxo
} from "./interface.js";
import { Psi } from "./Psi.js"
import { hexToBin } from "@bitauth/libauth";


export class PsiNetworkProvider implements NetworkProvider {

  public db!: Psi
  public DEBOUNCE: number = 500   // millseconds.

  public constructor(
    public network: Network,
    public failoverProviders?: NetworkProvider[],
    public debounce?: number
  ) {

    this.db = new Psi(network)

    failoverProviders = failoverProviders ? failoverProviders : []
    if (debounce) this.DEBOUNCE = debounce
  }

  public async getBlockHeight(): Promise<number> {


    let block = await this.db.getBlockHeight()

    if (block.id > 0 && block.timestamp) {
      let age = new Date().getTime() - block.timestamp.getTime()
      if (age < this.DEBOUNCE) {
        console.debug("debounced")
        return block.id
      }
    }

    if (this.failoverProviders) {
      let currentHeight = await this.failoverProviders[0]?.getBlockHeight()!
      await this.db.setBlockHeight(currentHeight)
      console.debug("network call, set")
      return currentHeight
    } else {
      throw Error("no blocks in index and no backup providers specified")
    }
  }


  public async getUtxos(address: string): Promise<Utxo[]> {
    let lockingBytecode = deriveLockingBytecode(address)
    let utxos = (await this.db.getUtxosByLockingBytecode(lockingBytecode)).map(phiUtxo => asUtxo(phiUtxo))
    if (this.failoverProviders) {
      let newUtxos = await this.failoverProviders[0]?.getUtxos(address)
      if (newUtxos) {
        let phiUtxos = newUtxos.map(utxo => asPsiUtxoI(utxo, lockingBytecode))
        if (phiUtxos) this.db.bulkPutUtxo(phiUtxos, lockingBytecode)
      }
      if (newUtxos) {
        return newUtxos
      }
    }
    return utxos

  }

  public async getRawTransaction(txid: string): Promise<string> {
    if (!this.failoverProviders) {
      throw Error("No failover network providers specified. Cannot get tx from cache.")
    } else {
      for (const p of this.failoverProviders) {
        try {
          return await p.getRawTransaction(txid)
        } catch (e: any) {
          console.debug(e)
        }
      }
      throw Error("Failover Transaction (get) Network providers exhausted, bailing")
    }

  }

  public async sendRawTransaction(txHex: string): Promise<string> {
    if (!this.failoverProviders) {
      throw Error("No failover network providers specified. Cannot send from cache.")
    } else {
      for (const p of this.failoverProviders) {
        try {
          return await p.sendRawTransaction(txHex)
        } catch (e: any) {
          console.debug(e)
        }
      }
      throw Error("Failover Broadcast Network Providers exhausted, bailing")
    }
  }


  public async search(host: string, param: BytecodePatternQueryI): Promise<string[]> {
    let cached: any[] = []
    cached = await this.db.getUnspentPhi(param)
    if (cached.length === 0) {
      console.debug("hitting chaingraph")
      let result = await getChaingraphUnspentRecords(
        host,
        param.prefix,
        param.node,
        param.limit,
        param.offset,
        param.exclude_pattern,
        param.after
      )
      this.db.bulkPutSearchOutputPrefix(result.data)
      // transform list of objects to a list of strings
      let results = result.data["search_output_prefix"].map((val: any) => {
        return val.locking_bytecode as string;
      });
      return results.map((x: string) => x.replace("\\x", ""));

    } else {
      return cached.map(r => r.id)
    }


  }


}

// There can only be 21M!, utxo formats.
// convert db utxo to standard electrumX/fulcrum format
export function asUtxo(utxo: PsiUtxoI): Utxo {
  let r = utxo.data
  delete r.lockingBytecode
  return {
    txid: r.tx_hash,
    vout: r.tx_pos,
    height: r.height,
    satoshis: r.value
  }
}

// convert db utxo to standard electrumX/fulcrum format
// NO. Strike the that, reverse it.
export function asPsiUtxoI(utxo: Utxo, locking_bytecode: Uint8Array | string): OutpointDetailsI {
  if (typeof locking_bytecode === "string") locking_bytecode = hexToBin(locking_bytecode)
  return {
    tx_hash: utxo.txid,
    tx_pos: utxo.vout,
    height: utxo.height!,
    value: utxo.satoshis,
    lockingBytecode: locking_bytecode
  }
}