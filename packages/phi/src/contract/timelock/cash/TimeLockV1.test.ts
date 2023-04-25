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
import { DUST_UTXO_THRESHOLD } from "../../../common/constant.js";

describe.skip(`TimeLock Tests`, () => {
  test("Should not pay before time is met, but should pay at time", async () => {
    expect.assertions(4);
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

    let lock = cashAddressToLockingBytecode(bob.getDepositAddress());
    if (typeof lock === "string") throw lock;
    let bytecode = lock.bytecode;
    let executorAllowance = 1200n;
    let period = 51n;
    let contract = new Contract(
      v1 as Artifact,
      [period, bytecode, executorAllowance],
      {provider: regtestNetwork, addressType: 'p2sh20'}
    );

    // fund the perp contract
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 1400000000,
        unit: "satoshis",
      },
    ]);
    expect(await contract.getBalance()).toEqual(1400000000n);

    await mine({
      cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
      blocks: 50,
    });

    let balance = await contract.getBalance();
    //try {
      let fn = contract.functions["execute"]!();

      // now += period;
      await fn
        .to([
          { to: bob.getDepositAddress(), amount: balance - executorAllowance },
          { to: charlie.getDepositAddress(), amount: DUST_UTXO_THRESHOLD },
        ])
        .withAge(Number(period))
        .withoutChange()
        .send();

    // } catch (e: any) {
    //   expect(e.message).toContain("non-BIP68-final (code 64)");
    // }
    await mine({
      cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
      blocks: 1,
    });

    fn = contract.functions["execute"]!();

    await fn
      .to([
        { to: bob.getDepositAddress(), amount: balance - executorAllowance },
        { to: charlie.getDepositAddress(), amount: DUST_UTXO_THRESHOLD },
      ])
      .withAge(Number(period))
      .withoutChange()
      .send();

      expect((await charlie.getBalance('sat'))).toBe(Number(546))
      expect((await bob.getBalance('sat'))).toBe(Number(balance - executorAllowance))
  });
});
