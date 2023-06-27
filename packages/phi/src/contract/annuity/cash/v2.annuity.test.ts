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

describe(`Bare Annuity Tests`, () => {
  test("Should pay a annuity contract", async () => {
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

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    const bob = await RegTestWallet.newRandom();
    const charlie = await RegTestWallet.newRandom();

    let lock = cashAddressToLockingBytecode(bob.getTokenDepositAddress());
    if (typeof lock === "string") throw lock;
    let bytecode = lock.bytecode;
    //let now = await regtestNetwork.getBlockHeight();
    let installment = 20000n;
    let period = 1n;
    let fee = 1500n;
    let contract = new Contract(
      v2 as Artifact,
      [period, bytecode, installment, fee],
      {provider: regtestNetwork, addressType: 'p2sh32'}
    );

    // fund the annuity contract
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 6000000,
        unit: "satoshis",
      },
    ]);

    await mine({
      cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
      blocks: 2,
    });

    let utxos = (await contract.getUtxos());
    let balance = utxos[0]!.satoshis
   
    let fn = contract.functions["execute"]!();

    let transaction = await fn
      .to([
        { to: bob.getTokenDepositAddress(), amount: installment + 3n },
        {
          to: contract.tokenAddress,
          amount: balance - (installment + 1500n) + 3n,
        },
        { to: charlie.getDepositAddress(), amount: 700n  },
      ])
      .withAge(1)
      .from([utxos[0]])
      .withoutChange();

    
        // const template =  await buildAuthenticationTemplate({
        //   contract: contract, 
        //   artifact: v2, 
        //   transaction: transaction, 
        //   network: Network.REGTEST,
        //   manglePrivateKeys: 
        //   false, includeSource:true})

     //console.log(getBitauthUri(template))
    await transaction.send();
    expect(await bob.getBalance("sat")).toBeGreaterThan(20000n);
  });




});
