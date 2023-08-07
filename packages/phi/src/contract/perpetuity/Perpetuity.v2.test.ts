import { mine, RegTestWallet } from "mainnet-js";
import { Perpetuity } from "./Perpetuity.js";
import { derivePublicKeyHashHex } from "../../common/util.js";
import { getAnAliceWallet } from "../../test/aliceWallet4test.js";

describe(`Perpetuity Class Tests`, () => {
  test("Should a serialize a Perpetuity", async () => {
    const p = new Perpetuity(
      4000n,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      1000n,
      12n,
      {version:2}
    );
    const chk = derivePublicKeyHashHex(
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr"
    );
    expect(p.toString()).toContain(chk);
    expect(p.toString()).toEqual(
      "P,2,4000,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787,1500,12,aa2041937540056af58d5b195860c75a225f68a5c117c8d2058cc93f2392b5e1819187"
    );

    const p2 = Perpetuity.fromString(p.toString());

    expect(p.toString()).toEqual(p2.toString());
    expect(p.getAddress()).toEqual(p2.getAddress());
    expect(p.isTestnet()).toEqual(p2.isTestnet());
  });


  


  test("Should a deserialize and reserialize a chipnet Perpetuity", async () => {
    const options = { version: 2, network: "chipnet" };
    const p = new Perpetuity(
      5n,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      2000n,
      120n,
      options
    );

    const p2 = Perpetuity.fromString(p.toString(), "chipnet");

    expect(p.toString()).toEqual(p2.toString());
    expect(p.getAddress()).toEqual(p2.getAddress());
    expect(p.isTestnet()).toEqual(p2.isTestnet());
  });

  test("Should a deserialize and reserialize a regtest Perpetuity to and from an opreturn", async () => {
    const options = { version: 2, network: "regtest" };
    const p1 = new Perpetuity(
      5n,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      2000n,
      120n,
      options
    );
    const opReturn = p1.toOpReturn();
    const p2 = Perpetuity.fromOpReturn(opReturn, "regtest");
    expect(p1.toString()).toEqual(p2.toString());
    expect(p2.isTestnet()).toEqual(true);
    expect(p1.getAddress()).toEqual(p2.getAddress());
  });

  test("Should pay a Perpetuity, to completion", async () => {
    const alice = await getAnAliceWallet(13000);
    const bob = await RegTestWallet.newRandom();
    const charlie = await RegTestWallet.newRandom();

    const options = { version: 2, network: "regtest" };
    const p1 = new Perpetuity(
      1n,
      bob.getDepositAddress(),
      Perpetuity.minAllowance,
      10n,
      options
    );

    // fund the perpetuity contract
    await alice.send([
      {
        cashaddr: p1.getAddress(),
        value: 12000,
        unit: "satoshis",
      },
    ]);


    for (let x = 0; x < 3; x++) {
      await mine({
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 1,
      });
      await p1.execute(charlie.getDepositAddress());
    }
    expect(await charlie.getBalance("sat")).toBeGreaterThan(2000);
    expect(await bob.getBalance("sat")).toBeGreaterThan(9000);
    expect(p1.isTestnet()).toEqual(true);
    expect(await p1.getBalance()).toBe(0n);
  });
});
