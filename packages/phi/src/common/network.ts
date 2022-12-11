import { ElectrumNetworkProvider  } from "cashscript";

export async function getBlockHeight():Promise<number>{
  let e = new ElectrumNetworkProvider();
  const height = await e.getBlockHeight()
  e.disconnectCluster()
  return height
}
