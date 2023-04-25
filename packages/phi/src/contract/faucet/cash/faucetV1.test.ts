import {
  ElectrumCluster,
  ClusterOrder,
  ElectrumTransport,
} from "electrum-cash";
import { Contract, ElectrumNetworkProvider } from "cashscript";
import { RegTestWallet, mine } from "mainnet-js";
import { artifact } from "./v1.js";

describe(`Faucet Contract Tests`, () => {
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

    let payout = 5000n;
    let index = 1n;
    let period = 1n;
    let contract = new Contract(
      artifact,
      [period, payout, index],
      {provider: regtestNetwork, addressType:"p2sh20"}
    );

    // fund the faucet contract
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 510000,
        unit: "satoshis",
      },
    ]);

    for (let x = 0; x < 5; x++) {
      await mine({
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 1,
      });
      let balance = await contract.getBalance();

      let size =
        BigInt((
          await contract!.functions
            .drip()
            .to([
              {
                to: contract.address,
                amount: balance - payout,
              },
              { to: bob.getDepositAddress(), amount: payout - 153n },
            ])
            .withAge(1)
            .withHardcodedFee(153n)
            .build()
        ).length) / 2n;
      //console.log(size)
      await contract!.functions
        .drip()
        .to([
          {
            to: contract.address,
            amount: balance - payout + 1n,
          },
          { to: bob.getDepositAddress(), amount: payout - (size + 4n) },
        ])
        .withAge(1)
        .withoutChange()
        .send();
    }

    expect(await bob.getBalance("sat")).toBeGreaterThanOrEqual(
      (payout - 200n) * 5n
    );
  });
});
