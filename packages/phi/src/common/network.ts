import {
  ElectrumCluster,
  ClusterOrder,
  ElectrumTransport,
} from "electrum-cash";
import { ElectrumUtxo, Utxo } from "./interface.js" 
import { addressToElectrumScriptHash } from "./util.js";
import { ElectrumNetworkProvider, NetworkProvider } from "cashscript";
import { PsiNetworkProvider } from "@unspent/psi";

export async function getBlockHeight(): Promise<number> {
  let e = new ElectrumNetworkProvider();
  const height = await e.getBlockHeight();
  e.disconnectCluster();
  return height;
}

export function getDefaultProvider(network="mainnet", chaingraphHost?:string){
  let provider:NetworkProvider;

  if (network === "mainnet") {
    // failover = getDefaultElectrumProvider("mainnet"); 
    // provider = new PsiNetworkProvider("mainnet", chaingraphHost, failover);
    provider = getDefaultElectrumProvider("mainnet"); //
  } else if (network === "chipnet") {
    let failover = getDefaultElectrumProvider("chipnet");
    provider = new PsiNetworkProvider("chipnet", chaingraphHost, failover);
  } 
  // fallback to fulcrum for regtest
  else if (network === "regtest") {
    let cluster = new ElectrumCluster(
      "@unspent/phi - regtest",
      "1.4.1",
      1,
      1,
      ClusterOrder.RANDOM
    );
    cluster.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);
    provider = new ElectrumNetworkProvider("regtest", cluster);
  } else throw "unrecognized network";

  provider.getUtxos = async function getUtxos(address: string): Promise<Utxo[]> {
    const scripthash = await addressToElectrumScriptHash(address);

    const filteringOption = 'include_tokens';

    // @ts-ignore
    const result = await provider.performRequest('blockchain.scripthash.listunspent', scripthash, filteringOption)! as ElectrumUtxo[];

    const utxos = result.map((utxo) => ({
      txid: utxo.tx_hash,
      vout: utxo.tx_pos,
      height: utxo.height,
      satoshis: BigInt(utxo.value),
      token: utxo.token_data ? {
        ...utxo.token_data,
        amount: BigInt(utxo.token_data.amount),
      } : undefined,
    }));

    return utxos;
  }


  return provider;
}



export function getDefaultElectrumProvider(network = "mainnet") {
  let provider = undefined;
  if (network === "mainnet") {
    let cluster = new ElectrumCluster(
      "@unspent/phi",
      "1.4.1",
      1,
      1,
      ClusterOrder.RANDOM,
      2000
    );

    cluster.addServer(
      "bch.imaginary.cash",
      50004,
      ElectrumTransport.WSS.Scheme,
      false
    );
    // cluster.addServer(
    //   "electrum.imaginary.cash",
    //   50004,
    //   ElectrumTransport.WSS.Scheme,
    //   false
    // );
    provider = new ElectrumNetworkProvider("mainnet", cluster, false);
  } else if (network === "chipnet") {
    provider = new ElectrumNetworkProvider("chipnet");
  } else if (network === "regtest") {
    let cluster = new ElectrumCluster(
      "@unspent/phi - regtest",
      "1.4.1",
      1,
      1,
      ClusterOrder.RANDOM
    );
    cluster.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);
    provider = new ElectrumNetworkProvider("regtest", cluster);
  } else throw "unrecognized network";
  return provider;
}
