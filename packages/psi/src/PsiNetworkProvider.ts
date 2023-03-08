import { Network, NetworkProvider } from "cashscript";
import { deriveLockingBytecode } from "@unspent/phi/dist/main/common/util.js";
import {
  PsiUtxoI,
  Utxo
} from "./interface.js";
import { Psi } from "./Psi.js"


export class PsiNetworkProvider implements NetworkProvider {

  public db!: Psi

  public constructor(
    public network: Network,
    public failoverProviders?: NetworkProvider[]
  ) {

    this.db = new Psi(network)
    failoverProviders = failoverProviders ? failoverProviders : []
  }

  public async getBlockHeight(): Promise<number> {
    let block = await this.db.block.reverse().first()

    //TODO: fail if timestamp is too old.

    // get the block height from a provider, set the block height.

    return block!.id
  }


  public async getUtxos(address: string): Promise<Utxo[]> {
    let lockingBytecode = deriveLockingBytecode(address)
    return (await this.db.getUtxosByLockingBytecode(lockingBytecode)).map(phiUtxo => asUtxo(phiUtxo))
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

}

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