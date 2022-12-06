import {
  ElectrumCluster,
  ClusterOrder,
  ElectrumTransport,
} from "electrum-cash";
import { Contract, ElectrumNetworkProvider } from "cashscript";
import { cashAddressToLockingBytecode } from "@bitauth/libauth";
import { RegTestWallet } from "mainnet-js";
import { artifact } from "./v1.js";
import { DUST_UTXO_THRESHOLD } from "../../../common/constant.js";

describe(`Gate Contract Tests`, () => {
  test("Should throw error if Gate threshold not met", async () => {
    expect.assertions(2);

    let regTest = new ElectrumCluster(
      "unspent phi-tests - faucet",
      "1.4.1",
      1,
      1,
      ClusterOrder.RANDOM,
      5000
    );
    regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

    let regtestNetwork = new ElectrumNetworkProvider("regtest", regTest, false);

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    const bob = await RegTestWallet.newRandom();

    let recipient = cashAddressToLockingBytecode(bob.getDepositAddress())
    if (typeof recipient === "string") throw (recipient)
    let recipientLockingBytecode = recipient.bytecode

    let threshold = 10000;
    let executorAllowance = 1200;
    let contract = new Contract(
      artifact,
      [threshold, recipientLockingBytecode, executorAllowance],
      regtestNetwork
    );

    // fund the Gate
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 1900,
        unit: "satoshis",
      },
    ]);


    let balance = await contract.getBalance();
    expect(balance).toBe(9900)

    try {
      let size =
        (
          await contract!.functions
            .execute()
            .to([
              { to: bob.getDepositAddress(), amount: balance - executorAllowance },
              { to: alice.getDepositAddress(), amount: DUST_UTXO_THRESHOLD },
            ])
            .withoutChange()
            .build()
        ).length / 2;
      //console.log(size)
      await contract!.functions
        .execute()
        .to([
          { to: bob.getDepositAddress(), amount: balance - executorAllowance },
          { to: alice.getDepositAddress(), amount: executorAllowance - size - 5 },
        ])
        .withoutChange()
        .send()
    } catch (e: any) {
      expect(e.message).toContain("mandatory-script-verify-flag-failed");
    }




  });

  test("Should pay Gate if threshold is met", async () => {

    let regTest = new ElectrumCluster(
      "unspent phi-tests - faucet",
      "1.4.1",
      1,
      1,
      ClusterOrder.RANDOM,
      5000
    );
    regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

    let regtestNetwork = new ElectrumNetworkProvider("regtest", regTest, false);

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    const bob = await RegTestWallet.newRandom();
    const charlie = await RegTestWallet.newRandom();

    let recipient = cashAddressToLockingBytecode(bob.getDepositAddress())
    if (typeof recipient === "string") throw (recipient)
    let recipientLockingBytecode = recipient.bytecode

    let threshold = 10000;
    let executorAllowance = 1200;
    let contract = new Contract(
      artifact,
      [threshold, recipientLockingBytecode, executorAllowance],
      regtestNetwork
    );

    // fund the Gate
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 1200,
        unit: "satoshis",
      },
    ]);


    let balance = await contract.getBalance();
    expect(balance).toBe(11200)

    let txOutput0 = (balance - executorAllowance + 1)

    let size =
      (
        await contract!.functions
          .execute()
          .to([
            { to: bob.getDepositAddress(), amount: txOutput0 },
            { to: charlie.getDepositAddress(), amount: DUST_UTXO_THRESHOLD },
          ])
          .withoutChange()
          .build()
      ).length / 2;


    let executorTake = (executorAllowance - size - 6)


    // console.log(txOutput0)
    // console.log(executorTake)
    // let inputValue = txOutput0 + executorTake

    // // assure total input minus recipient dispersement is less than executor allowance
    // console.log(executorAllowance >= inputValue - txOutput0);

    // // require the value paid (minus fees) exceeds the threshold.
    // console.log(txOutput0 >= threshold);
    // console.log("size", size)
    // console.log(txOutput0)
    // console.log(executorTake)

    await contract!.functions
      .execute()
      .to([
        { to: bob.getDepositAddress(), amount: txOutput0 },
        { to: charlie.getDepositAddress(), amount: executorTake },
      ])
      .withoutChange()
      .send()

    expect((await bob.getBalance('sat'))).toBeGreaterThan(threshold)
    expect((await charlie.getBalance('sat'))).toBe(executorTake)
    expect((await contract.getBalance())).toBe(0)

  });

  test("Should throw error if executorAllowance exceeded", async () => {
    expect.assertions(2);

    let regTest = new ElectrumCluster(
      "unspent phi-tests - faucet",
      "1.4.1",
      1,
      1,
      ClusterOrder.RANDOM,
      5000
    );
    regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

    let regtestNetwork = new ElectrumNetworkProvider("regtest", regTest, false);

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    const bob = await RegTestWallet.newRandom();

    let recipient = cashAddressToLockingBytecode(bob.getDepositAddress())
    if (typeof recipient === "string") throw (recipient)
    let recipientLockingBytecode = recipient.bytecode

    let threshold = 10000;
    let executorAllowance = 1200;
    let contract = new Contract(
      artifact,
      [threshold, recipientLockingBytecode, executorAllowance],
      regtestNetwork
    );

    // fund the Gate
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 2000,
        unit: "satoshis",
      }, {
        cashaddr: contract.address!,
        value: 20000,
        unit: "satoshis",
      },
    ]);


    let balance = await contract.getBalance();
    expect(balance).toBe(28000)

    try {
      await contract!.functions
        .execute()
        .to([
          { to: bob.getDepositAddress(), amount: threshold+1 },
          { to: alice.getDepositAddress(), amount: executorAllowance +10000 },
        ])
        .withoutChange()
        .send()
    } catch (e: any) {
      expect(e.message).toContain("mandatory-script-verify-flag-failed");
    }

  });

});
