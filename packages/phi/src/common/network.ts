import {
  ElectrumCluster,
  ClusterOrder,
  ElectrumTransport,
} from "electrum-cash";
import { ElectrumNetworkProvider } from "cashscript";

export async function getBlockHeight(): Promise<number> {
  let e = new ElectrumNetworkProvider();
  const height = await e.getBlockHeight();
  e.disconnectCluster();
  return height;
}

export function getDefaultProvider(network = "mainnet") {
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
    cluster.addServer(
      "electrum.imaginary.cash",
      50004,
      ElectrumTransport.WSS.Scheme,
      false
    );
    provider = new ElectrumNetworkProvider("mainnet", cluster, false);
  } else if (network === "staging") {
    provider = new ElectrumNetworkProvider("staging");
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
