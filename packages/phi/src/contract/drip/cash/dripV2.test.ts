import {
    ElectrumCluster,
    ClusterOrder,
    ElectrumTransport,
  } from "electrum-cash";
  import { Contract, ElectrumNetworkProvider } from "cashscript";
  import { RegTestWallet, mine } from "mainnet-js";
  import { artifact } from "./v2.js";
  import { getAnAliceWallet } from "../../../test/aliceWallet4test.js"
  
  describe(`Faucet Contract Tests`, () => {
    test("Should pay a mev faucet contract 5 times in 5 blocks", async () => {
      let regTest = new ElectrumCluster(
        "utxfi-tests - faucet",
        "1.4.1",
        1,
        1,
        ClusterOrder.RANDOM,
        5000
      );
      regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);
  
      let regtestNetwork = new ElectrumNetworkProvider("regtest", regTest, false);
     
      const alice = await getAnAliceWallet(4900000000);
      const bob = await RegTestWallet.fromSeed(
        "rubber amateur across squirrel deposit above dish toddler visa cherry clerk egg"
      );
  
      let payout = 5000n;
      let period = 1n;
      let contract = new Contract(
        artifact,
        [],
        {provider: regtestNetwork, addressType: "p2sh20"}
      );
  
      // fund the faucet contract
      await alice.sendMax(contract.address!);
  
      for (let x = 0; x < 5; x++) {
        
        await mine({
          cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
          blocks: 1,
        });
        let balance = await contract.getBalance();
        let newBalance = balance - BigInt(balance * 4392n / 1333036486n) +10n
        let size =
          BigInt((
            await contract!.functions
              .drip()
              .to(contract.address, newBalance )
              .withAge(1)
              .withoutChange()
              .build()
          ).length) / 2n;
        //console.log(size)
        await contract!.functions
          .drip()
          .to(contract.address, newBalance )
          .withAge(1)
          .withoutChange()
          .send();
      }
  
      expect(await contract.getBalance()).toBeGreaterThanOrEqual(
        4899919054n
      );
    });
  });
  