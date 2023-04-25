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

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    const bob = await RegTestWallet.fromSeed(
      "rubber amateur across squirrel deposit above dish toddler visa cherry clerk egg"
    );
    const charlie = await RegTestWallet.newRandom();

    let lock = cashAddressToLockingBytecode(bob.getDepositAddress());
    if (typeof lock === "string") throw lock;
    let bytecode = lock.bytecode;
    //let now = await regtestNetwork.getBlockHeight();
    let fee = 5000n;
    let decay = 120n;
    let period = 1n;
    let contract = new Contract(
      v1 as Artifact,
      [period, bytecode, fee, decay],
      {provider: regtestNetwork, addressType: 'p2sh20'}
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
      blocks: 5,
    });
    for (let x = 0n; x < 5n; x++) {
      await mine({
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 1,
      });
      let balance = await contracts.slice(-1)[0]!.getBalance();
      let installment = balance / decay;
      let fn = contracts.slice(-1)[0]!.functions["execute"]!();

      //now += period;
      await fn
        .to([
          { to: bob.getDepositAddress(), amount: installment + 3n },
          {
            to: contract.address,
            amount: balance - (installment + fee) + 3n,
          },
          { to: charlie.getDepositAddress(), amount: 700n + x },
        ])
        .withAge(1)
        .withoutChange()
        .send();

      contracts.push(contract);
    }

    expect(await bob.getBalance("sat")).toBeGreaterThan(25000000);
  });
});
