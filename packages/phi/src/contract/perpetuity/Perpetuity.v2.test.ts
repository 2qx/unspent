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
      "P,2,4000,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787,1000,12,aa20ff9c96d932a8455160b0496865974c461455b685b46bb4aff254f037cfdebb2387"
    );

    const p2 = Perpetuity.fromString(p.toString());

    expect(p.toString()).toEqual(p2.toString());
    expect(p.getAddress()).toEqual(p2.getAddress());
    expect(p.isTestnet()).toEqual(p2.isTestnet());
  });


  test("Should denote special Perpetuities", async () => {
    expect.assertions(1);
    try {
      const p = new Perpetuity(
        4000n,
        "bitcoincash:qpgf0ztxq3mwfq6eg5versgfdzq9c3pwv5jsk6wnay",
        1000n,
        12n,
        {version:2}
      );
      // error 
    } catch (e: any) {
      expect(e.message).toBe(
        "Contract is too special"
      );
    }

    

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
    expect.assertions(5);
    const alice = await getAnAliceWallet(101000);
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
        value: 14000,
        unit: "satoshis",
      },
    ]);


    for (let x = 0; x < 4; x++) {
      await mine({
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 1,
      });
      try{
        await p1.execute(charlie.getDepositAddress());
      } catch(e){
        expect(e.message).toBe("No funds on contract")
      }
    }
    expect(await charlie.getBalance("sat")).toBeGreaterThan(1710);
    expect(await bob.getBalance("sat")).toBeGreaterThan(10000);
    expect(p1.isTestnet()).toEqual(true);
    expect(await p1.getBalance()).toBe(0n);
  });
});
