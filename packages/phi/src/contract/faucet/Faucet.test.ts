import { Faucet } from "./Faucet.js";
import { RegTestWallet, mine } from "mainnet-js";
import { deriveLockingBytecodeHex } from "../../common/util.js";
import { getAnAliceWallet } from "../../test/aliceWallet4test.js";

describe(`Faucet Class Tests`, () => {
  test("Should serialize a faucet (v0)", async () => {
    let f = new Faucet(undefined, undefined, undefined, {version:0});
    let chk = deriveLockingBytecodeHex(f.getAddress());
    expect(f.toString()).toContain(chk);
    expect(f.toString()).toEqual(`F,0,1,1000,1,${chk}`);

    let f2 = Faucet.fromString(f.toString());

    expect(f.toString()).toEqual(f2.toString());
    expect(f.toOpReturn()).toEqual(f2.toOpReturn());
    expect(f.toOpReturn()).toEqual(Faucet.fromOpReturn(f2.toOpReturn()).toOpReturn());
    expect(f.getAddress()).toEqual(f2.getAddress());
    expect(f.isTestnet()).toEqual(f2.isTestnet());
  });

  test("Should serialize a faucet (v1)", async () => {
    let f = new Faucet(undefined,undefined,undefined,{version:1});
    let chk = deriveLockingBytecodeHex(f.getAddress());
    expect(f.toString()).toContain(chk);
    expect(f.toString()).toEqual(`F,1,1,1000,1,${chk}`);

    let f2 = Faucet.fromString(f.toString());

    expect(f.toString()).toEqual(f2.toString());
    expect(f.getAddress()).toEqual(f2.getAddress());
    expect(f.isTestnet()).toEqual(f2.isTestnet());
  });

  test("Should deserialize and reserialize a chipnet faucet", async () => {
    let f = new Faucet(5n, 3000n, 2n, { version: 1, network: "chipnet" });

    let f2 = Faucet.fromString(f.toString(), "chipnet");

    expect(f.toString()).toEqual(f2.toString());
    expect(f.getAddress()).toEqual(f2.getAddress());
    expect(f.isTestnet()).toEqual(f2.isTestnet());
  });

  test("Should deserialize and reserialize a regtest Faucet to chunks and from an opreturn", async () => {
    let options = { version: 1, network: "regtest" };
    let f1 = new Faucet(5n, 3000n, 2n, options);
    let opReturn = f1.toOpReturn();
    let f2 = Faucet.fromOpReturn(opReturn, "regtest");
    expect(f1.toString()).toEqual(f2.toString());
    expect(f2.isTestnet()).toEqual(true);
    expect(f1.getAddress()).toEqual(f2.getAddress());
  });

  test("Should return info", async () => {
    let options = { version: 1, network: "regtest" };
    let f1 = new Faucet(5n, 3000n, 2n, options);
    let info = await f1.info(false);
    expect(info).toContain(f1.toString());
    expect(info).toContain("balance");
  });

  test("Should drip the faucet (v2) to completion", async () => {
    let options = { version: 2, network: "regtest" };
    let f1 = new Faucet(0n, 5000n, 2n, options);

    const alice = await getAnAliceWallet(100000);
    const bob = await RegTestWallet.newRandom();
    const charlie = await RegTestWallet.newRandom();

    await alice.send([
      {
        cashaddr: f1.getAddress(),
        value: 15000,
        unit: "satoshis",
      },
      {
        cashaddr: f1.getAddress(),
        value: 14000,
        unit: "satoshis",
      },
    ]);

    for (let x = 0; x < 6; x++) {
      await f1.execute(charlie.getDepositAddress());
    }

    expect(await charlie.getBalance("sat")).toBeGreaterThan(25000);
    expect(f1.isTestnet()).toEqual(true);
    expect(await f1.getBalance()).toBe(0n);


  });

});

