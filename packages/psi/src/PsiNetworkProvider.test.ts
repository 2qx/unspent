import { ElectrumCluster, ClusterOrder, ElectrumTransport } from "electrum-cash";
import { ElectrumNetworkProvider } from "cashscript";
import { PsiNetworkProvider } from "./PsiNetworkProvider";
import {  mine } from "mainnet-js";

test("Should store the height", async () => {
  let regTest = new ElectrumCluster(
    "CashScript Application",
    "1.4.1",
    1,
    1,
    ClusterOrder.PRIORITY,
    2000
  );
  regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);
  
  let fulcrumProvider = new ElectrumNetworkProvider("regtest", regTest, false);

  let psiProvider = new PsiNetworkProvider("regtest",[fulcrumProvider],50)

  let initalHeight = await psiProvider.getBlockHeight()

  expect(initalHeight).toBeGreaterThan(200)

  await mine({
    cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
    blocks: 100,
  });

  
  let newHeight = await psiProvider.getBlockHeight()

  expect(newHeight-initalHeight).toBe(100)


});


test("Should get utxos transaction over the network", async () => {
  let regTest = new ElectrumCluster(
    "CashScript Application",
    "1.4.1",
    1,
    1,
    ClusterOrder.PRIORITY,
    2000
  );
  regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);
  
  let fulcrumProvider = new ElectrumNetworkProvider("regtest", regTest, false);

  let psiProvider = new PsiNetworkProvider("regtest",[fulcrumProvider],500)

  let utxos = await psiProvider.getUtxos("bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f")
  expect(utxos.length).toBeGreaterThan(50)
  
  let raw = await psiProvider.getRawTransaction(utxos[50].txid)

  //console.log(raw)
  expect(raw.length).toBeGreaterThan(100)


});

