import { ElectrumNetworkProvider, Network, NetworkProvider } from "cashscript";
import {
  BytecodePatternQueryI,
  deriveLockingBytecode,
  getChaingraphUnspentRecords,
  getHistory,
  prepareBytecodeQueryParameters
} from "@unspent/phi"
import {
  Utxo
} from "./interface.js";
import {
  //   getMaxBlockHeight,
  asUtxo
} from "./util.js"
import { Psi } from "./Psi.js"
import { binToHex } from "@bitauth/libauth";


export class PsiNetworkProvider implements NetworkProvider {

  public db!: Psi
  public DEBOUNCE: number = 300 * 1000   // five minutes (half a blocktime) in milliseconds.
  public FUZZ: number = 300 * 1000

  public constructor(
    public network: Network,
    public chaingraphHost: string,
    public failoverProviders?: ElectrumNetworkProvider[],
    public debounce?: number,
    public fuzz?: number
  ) {

    this.db = new Psi(network)

    failoverProviders = failoverProviders ? failoverProviders : []
    if (debounce) this.DEBOUNCE = debounce
    if (fuzz) this.FUZZ = fuzz
  }

  public async getBlockHeight(): Promise<number> {


    const block = await this.db.getBlockHeight()

    if (block.id > 0 && block.timestamp) {
      const age = new Date().getTime() - block.timestamp.getTime()
      if (age < this.DEBOUNCE) {
        return block.id
      }
    }

    if (this.failoverProviders) {
      const currentHeight = await this.failoverProviders[0]?.getBlockHeight()!
      await this.db.setBlockHeight(currentHeight)
      return currentHeight
    } else {
      throw Error("no blocks in index and no backup providers specified")
    }
  }


  public async getUtxos(address: string): Promise<Utxo[]> {
    const lockingBytecode = deriveLockingBytecode(address)
    const lockingBytecodeHex = binToHex(lockingBytecode)
    const psiOutpoints = await this.db.getUtxosByLockingBytecode(lockingBytecode)
    let ageFilter = new Date().getTime() - this.DEBOUNCE
    let goodUtxos = psiOutpoints.filter(op => op.debounce > ageFilter)
    if (Array.isArray(goodUtxos) && goodUtxos.length > 0) {
      // some time ago
      return goodUtxos.map(op => asUtxo(op))
    } else {
      const history = await getHistory(this.chaingraphHost, lockingBytecode, { after: 0, limit: 5 })
      return (await this.db.bulkPutRawTransaction(history, lockingBytecodeHex)).map(u => asUtxo(u))
    }

  }


  public async getRawTransaction(txid: string): Promise<string> {
    if (!this.failoverProviders) {
      throw Error("No failover network providers specified. Cannot get tx from cache.")
    } else {
      // TODO replace with chaingraph raw transaction getter.
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
      // replace with chaingraph send
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



  public async search(param?: BytecodePatternQueryI ): Promise<string[]> {

    let cached: any[] = []
    param = prepareBytecodeQueryParameters(param)
    cached = await this.db.getUnspentPhiContracts(param)

    if (cached.length < param.limit!) {
      console.debug("hitting chaingraph")
      const result = await getChaingraphUnspentRecords(
        this.chaingraphHost,
        param
      )
      this.db.bulkPutUnspentPhiContracts(result)
      // transform list of objects to a list of strings
      return result.map((r: any) => r.id)

    } else {
      return cached.map(r => r.id)
    }


  }


}

