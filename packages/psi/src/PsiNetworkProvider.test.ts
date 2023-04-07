import { ElectrumCluster, ClusterOrder, ElectrumTransport } from "electrum-cash";
import { ElectrumNetworkProvider } from "cashscript";
import { PsiNetworkProvider } from "./PsiNetworkProvider";
import { mine } from "mainnet-js";

// TODO reenable
// test("Should store the height", async () => {
//   const regTest = new ElectrumCluster(
//     "CashScript Application",
//     "1.4.1",
//     1,
//     1,
//     ClusterOrder.PRIORITY,
//     2000
//   );
//   const host = "https://demo.chaingraph.cash/v1/graphql";
//   regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

//   const fulcrumProvider = new ElectrumNetworkProvider("regtest", regTest, false);

//   const psiProvider = new PsiNetworkProvider("regtest", host, [fulcrumProvider], 50)

//   const initialHeight = await psiProvider.getBlockHeight()

//   expect(initialHeight).toBeGreaterThan(200)

//   await mine({
  // /* cspell:disable-next-line */ 
//     cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
//     blocks: 150,
//   });

//   const newHeight = await psiProvider.getBlockHeight()
//   expect(newHeight - initialHeight).toBeGreaterThan(90)

// });


test("Should get a utxo", async () => {
  const cluster = new ElectrumCluster(
    "CashScript Application",
    "1.4.1",
    1,
    1,
    ClusterOrder.PRIORITY,
    2000
  );
  const host = "https://demo.chaingraph.cash/v1/graphql";
  cluster.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

  const fulcrumProvider = new ElectrumNetworkProvider("mainnet", cluster, false);

  const psiProvider = new PsiNetworkProvider("mainnet", host, [fulcrumProvider], 50)

  const utxos = await psiProvider.getUtxos("bitcoincash:pz6qg80k3tps0zexq0kkxreen2ndscvqwve8l0r6vn")

  expect(utxos.length).toBe(1)

});



