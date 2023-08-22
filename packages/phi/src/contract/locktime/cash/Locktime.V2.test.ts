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
import { DUST_UTXO_THRESHOLD } from "../../../common/constant.js";
import { getAnAliceWallet } from "../../../test/aliceWallet4test.js";

describe.skip(`TimeLock Tests`, () => {
  test("Should not pay before time is met, but should pay at time", async () => {
    
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

    const alice = await getAnAliceWallet(1400006000)
    const bob = await RegTestWallet.newRandom();
    const charlie = await RegTestWallet.newRandom();

    let lock = cashAddressToLockingBytecode(bob.getDepositAddress());
    if (typeof lock === "string") throw lock;
    let bytecode = lock.bytecode;
    let executorAllowance = 1200n;
    let period = 11n;
    let contract = new Contract(
      v2 as Artifact,
      [period, bytecode, executorAllowance],
      { provider: regtestNetwork, addressType: 'p2sh20' }
    );

    // fund the contract
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
      blocks: 10,
    });

    let balance = await contract.getBalance();
      let fn = contract.functions["execute"]!();

    await fn
      .to([
        { to: bob.getDepositAddress(), amount: balance - executorAllowance },
        { to: charlie.getDepositAddress(), amount: DUST_UTXO_THRESHOLD },
      ])
      .withoutChange()
      .send();


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
