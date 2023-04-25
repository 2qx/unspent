import { Mine } from "./Mine.js";
import { RegTestWallet, mine as mineBlocks } from "mainnet-js";

describe(`Mine Class Tests`, () => {
  test("Should serialize a 'mine' contract", async () => {
    const m = new Mine();
    expect(m.toString()).toEqual(
      `M,1,1,5000,3,00000000000000,a914df288c9062bc5b1a7180d83ca19a7231b0fb50ad87`
    );

    const m2 = Mine.fromString(m.toString());

    expect(m.toString()).toEqual(m2.toString());
    expect(m.getAddress()).toEqual(m2.getAddress());
    expect(m.isTestnet()).toEqual(m2.isTestnet());
  });

  test("Should deserialize and reserialize a chipnet mine", async () => {
    const m = new Mine(5n, Mine.minPayout, 2n, undefined, {
      version: 1,
      network: "chipnet",
    });

    const m2 = Mine.fromString(m.toString(), "chipnet");

    expect(m.toString()).toEqual(m2.toString());
    expect(m.getAddress()).toEqual(m2.getAddress());
    expect(m.isTestnet()).toEqual(m2.isTestnet());
  });

  test("Should deserialize and reserialize a regtest Mine to chunks and from an op_return", async () => {
    const options = { version: 1, network: "regtest" };
    const m1 = new Mine(5n, Mine.minPayout, 2n, undefined, options);
    const opReturn = m1.toOpReturn();
    const m2 = Mine.fromOpReturn(opReturn, "regtest");
    expect(m1.toString()).toEqual(m2.toString());
    expect(m2.isTestnet()).toEqual(true);
    expect(m1.getAddress()).toEqual(m2.getAddress());
  });

  test("Should 'mine' a payout to an address", async () => {
    const options = { version: 1, network: "regtest" };
    const m1 = new Mine(5n, Mine.minPayout, 2n, undefined, options);

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    const bob = await RegTestWallet.newRandom();

    await alice.send([
      {
        cashaddr: m1.getAddress(),
        value: 50000,
        unit: "satoshis",
      },
    ]);
    await mineBlocks({ cashaddr: alice.getDepositAddress(), blocks: 6 });
    expect(await m1.getBalance()).toBeGreaterThan(100);
    m1.getAddress();
    const response = await m1.execute(bob.getDepositAddress());
    expect(await bob.getBalance("sats")).toBeGreaterThan(300);
  });

  test("Should return info", async () => {
    const options = { version: 1, network: "regtest" };
    const c1 = new Mine(5n, Mine.minPayout, 2n, undefined, options);
    const info = await c1.info(false);
    expect(info).toContain(c1.toString());
    expect(info).toContain("balance");
  });
});
