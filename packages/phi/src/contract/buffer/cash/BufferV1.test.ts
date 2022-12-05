import {
  ElectrumCluster,
  ClusterOrder,
  ElectrumTransport,
} from "electrum-cash";
import { Contract, ElectrumNetworkProvider } from "cashscript";
import { cashAddressToLockingBytecode } from "@bitauth/libauth";
import { RegTestWallet, mine } from "mainnet-js";
import { artifact } from "./v1.js";

describe(`Buffer Contract Tests`, () => {
  test("Should pay a faucet contract 5 times in 5 blocks", async () => {
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
    const bob = await RegTestWallet.fromSeed(
      "rubber amateur across squirrel deposit above dish toddler visa cherry clerk egg"
    );

    let payout = 5000;
    let recipient  = cashAddressToLockingBytecode(bob.getDepositAddress())
    if (typeof recipient === "string") throw(recipient)
    let recipientLockingBytecode = recipient.bytecode

    let threshold = 10000;
    let executorAllowance = 1200;
    let contract = new Contract(
      artifact,
      [threshold, recipientLockingBytecode, executorAllowance],
      regtestNetwork
    );

    // fund the faucet contract
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 1000,
        unit: "satoshis",
      },
    ]);

    for (let x = 0; x < 5; x++) {

      let balance = await contract.getBalance();

      let size =
        (
          await contract!.functions
            .execute()
            .to([
              {
                to: contract.address,
                amount: balance - payout,
              },
              { to: bob.getDepositAddress(), amount: payout - 153 },
            ])
            .withHardcodedFee(153)
            .build()
        ).length / 2;
      //console.log(size)
      await contract!.functions
        .drip()
        .to([
          {
            to: contract.address,
            amount: balance - payout + 1,
          },
          { to: bob.getDepositAddress(), amount: payout - (size + 4) },
        ])
        .withAge(1)
        .withoutChange()
        .send();
    }

    expect(await bob.getBalance("sat")).toBeGreaterThanOrEqual(
      (payout - 200) * 5
    );
  });
});
