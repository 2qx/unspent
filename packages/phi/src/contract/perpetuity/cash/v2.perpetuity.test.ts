import type { Artifact } from "cashscript";
import { cashAddressToLockingBytecode } from "@bitauth/libauth";
import {
  ElectrumCluster,
  ClusterOrder,
  ElectrumTransport,
} from "electrum-cash";
import { Contract, ElectrumNetworkProvider } from "cashscript";
import { RegTestWallet, mine } from "mainnet-js";
import { artifact as v2 } from "./v2.js";
import { Network } from "../../../common/interface.js" 
import { buildAuthenticationTemplate, getBitauthUri } from "../../../common/template.js" 

import { getAnAliceWallet } from "../../../test/aliceWallet4test.js"

describe(`Example Perpetuity Tests`, () => {
  test("Should pay a perpetuity contract", async () => {
    let regTest = new ElectrumCluster(
      "CashScript Application",
      "1.4.1",
      1,
      1,
      ClusterOrder.PRIORITY,
      2000
    );
    regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

    let regtestNetwork = new ElectrumNetworkProvider("regtest", regTest, false);

    const alice = await getAnAliceWallet(680050000);
    const bob = await RegTestWallet.fromSeed(
      "rubber amateur across squirrel deposit above dish toddler visa cherry clerk egg"
    );
    const charlie = await RegTestWallet.newRandom();

    let lock = cashAddressToLockingBytecode(bob.getTokenDepositAddress());
    if (typeof lock === "string") throw lock;
    let bytecode = lock.bytecode;
    //let now = await regtestNetwork.getBlockHeight();
    let decay = 120n;
    let fee = 1500n;
    let period = 1n;
    let contract = new Contract(
      v2 as Artifact,
      [period, bytecode, fee, decay],
      {provider: regtestNetwork, addressType: 'p2sh32'}
    );

    // fund the contract
    
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 680000000,
        unit: "satoshis",
      },
    ]);

    await mine({
      cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
      blocks: 1,
    });

    let utxos = (await contract.getUtxos());
    let balance = utxos[0]!.satoshis
    let installment = balance / decay;
    
    let fn = contract.functions["execute"]!();
    let transaction = await fn
      .to([
        { to: bob.getTokenDepositAddress(), amount: installment + 3n },
        {
          to: contract.address,
          amount: balance - (installment + 1500n) + 3n,
        },
        { to: charlie.getDepositAddress(), amount: 700n  },
      ])
      .withAge(1)
      .from([utxos[0]])
      .withoutChange();

    
      const template =  await buildAuthenticationTemplate({
        contract: contract, 
        artifact: v2, 
        transaction: transaction, 
        network: Network.REGTEST,
        manglePrivateKeys: 
        false, includeSource:true})

     //console.log(getBitauthUri(template))
     
     await transaction.send()
     utxos = await  contract.getUtxos()
     expect(utxos.length).toBe(1)
    expect(await bob.getBalance("sat")).toBeGreaterThan(5666660);
  });

});
