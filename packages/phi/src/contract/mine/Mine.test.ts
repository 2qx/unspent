import { Mine } from "./Mine.js";
import { RegTestWallet, mine as mineBlocks } from "mainnet-js";

describe(`Mine Class Tests`, () => {
  test("Should serialize a 'mine' contract", async () => {
    let m = new Mine();
    expect(m.toString()).toEqual(
      `M,1,1,5000,3,00000000000000,a914df288c9062bc5b1a7180d83ca19a7231b0fb50ad87`
    );

    let m2 = Mine.fromString(m.toString());

    expect(m.toString()).toEqual(m2.toString());
    expect(m.getAddress()).toEqual(m2.getAddress());
    expect(m.isTestnet()).toEqual(m2.isTestnet());
  });

  test("Should deserialize and reserialize a staging mine", async () => {
    let m = new Mine(5, Mine.minPayout, 2, undefined, {
      version: 1,
      network: "staging",
    });

    let m2 = Mine.fromString(m.toString(), "staging");

    expect(m.toString()).toEqual(m2.toString());
    expect(m.getAddress()).toEqual(m2.getAddress());
    expect(m.isTestnet()).toEqual(m2.isTestnet());
  });

  test("Should deserialize and reserialize a regtest Mine to chunks and from an opreturn", async () => {
    let options = { version: 1, network: "regtest" };
    let m1 = new Mine(5, Mine.minPayout, 2, undefined, options);
    let opReturn = m1.toOpReturn();
    let m2 = Mine.fromOpReturn(opReturn, "regtest");
    expect(m1.toString()).toEqual(m2.toString());
    expect(m2.isTestnet()).toEqual(true);
    expect(m1.getAddress()).toEqual(m2.getAddress());
  });

  test("Should 'mine' a payout to an address", async () => {
    let options = { version: 1, network: "regtest" };
    let m1 = new Mine(5, Mine.minPayout, 2, undefined, options);

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
    let response = await m1.execute(bob.getDepositAddress());
    expect(await bob.getBalance("sats")).toBeGreaterThan(300);
  });

  test("Should return info", async () => {
    let options = { version: 1, network: "regtest" };
    let c1 = new Mine(5, Mine.minPayout, 2, undefined, options);
    let info = await c1.info(false);
    expect(info).toContain(c1.toString());
    expect(info).toContain("balance");
  });
});
