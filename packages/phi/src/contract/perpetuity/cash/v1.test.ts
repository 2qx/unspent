import type { Artifact } from "cashscript";
import { cashAddressToLockingBytecode } from "@bitauth/libauth";
import {
  ElectrumCluster,
  ClusterOrder,
  ElectrumTransport,
} from "electrum-cash";
import { Contract, ElectrumNetworkProvider } from "cashscript";
import { RegTestWallet, mine } from "mainnet-js";
import { artifact as v1 } from "./v1.js";

describe(`Example Perpituity Tests`, () => {
  test("Should pay a perpituity contract", async () => {
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
    const bob = await RegTestWallet.fromSeed(
      "rubber amateur across squirrel deposit above dish toddler visa cherry clerk egg"
    );
    const charlie = await RegTestWallet.newRandom();

    let lock = cashAddressToLockingBytecode(bob.getDepositAddress());
    if (typeof lock === "string") throw lock;
    let bytecode = lock.bytecode;
    //let now = await regtestNetwork.getBlockHeight();
    let fee = 5000;
    let decay = 120;
    let period = 1;
    let contract = new Contract(
      v1 as Artifact,
      [period, bytecode, fee, decay],
      regtestNetwork
    );

    // fund the perp contract
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 680000000,
        unit: "satoshis",
      },
    ]);

    let contracts = [contract];
    await mine({
      cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
      blocks: 5000,
    });
    for (let x = 0; x < 5; x++) {
      await mine({
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 1,
      });
      let balance = await contracts.slice(-1)[0]!.getBalance();
      let installment = Math.round(balance / decay);
      let fn = contracts.slice(-1)[0]!.functions["execute"]!();

      //now += period;
      await fn
        .to([
          { to: bob.getDepositAddress(), amount: installment + 3 },
          {
            to: contract.address,
            amount: balance - (installment + fee) + 3,
          },
          { to: charlie.getDepositAddress(), amount: 700 + x },
        ])
        .withAge(1)
        .withoutChange()
        .send();

      contracts.push(contract);
    }

    expect(await bob.getBalance("sat")).toBeGreaterThan(25000000);
  });
});
