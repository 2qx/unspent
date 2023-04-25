import { mine, RegTestWallet, delay } from "mainnet-js";
import { TimeLock } from "./TimeLock.js";
import { derivePublicKeyHashHex } from "../../common/util.js";

describe.skip(`TimeLock Class Tests`, () => {
  test("Should a serialize a TimeLock", async () => {
    let c = new TimeLock(
      6000n,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      1000n
    );
    let chk = derivePublicKeyHashHex(
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr"
    );
    expect(c.toString()).toContain(chk);
    expect(c.toString()).toEqual(
      "T,1,6000,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787,1000,a9149e25075d0d2da4675343d9d727035b9984ae46ff87"
    );

    let c2 = TimeLock.fromString(c.toString());

    expect(c.toString()).toEqual(c2.toString());
    expect(c.getAddress()).toEqual(c2.getAddress());
    expect(c.isTestnet()).toEqual(c2.isTestnet());
  });

  test("Should a deserialize and reserialize a chipnet TimeLock", async () => {
    let options = { version: 1, network: "chipnet" };
    let c = new TimeLock(
      5000n,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      2000n,
      options
    );

    let c2 = TimeLock.fromString(c.toString(), "chipnet");

    expect(c.toString()).toEqual(c2.toString());
    expect(c.getAddress()).toEqual(c2.getAddress());
    expect(c.isTestnet()).toEqual(c2.isTestnet());
  });

  test("Should a deserialize and reserialize a regtest TimeLock to and from an opreturn", async () => {
    let options = { version: 1, network: "regtest" };
    let c1 = new TimeLock(
      5000n,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      2000n,
      options
    );
    let opReturn = c1.toOpReturn();
    let c2 = TimeLock.fromOpReturn(opReturn, "regtest");
    expect(c1.toString()).toEqual(c2.toString());
    expect(c2.isTestnet()).toEqual(true);
    expect(c1.getAddress()).toEqual(c2.getAddress());
  });

  test("Should pay a TimeLock", async () => {
    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    const bob = await RegTestWallet.newRandom();
    const charlie = await RegTestWallet.newRandom();

    let options = { version: 1, network: "regtest" };
    let c1 = new TimeLock(1n, bob.getDepositAddress(), TimeLock.minAllowance, options);

    await alice.send([
      {
        cashaddr: c1.getAddress(),
        value: 1000000,
        unit: "satoshis",
      },
    ]);

    await mine({
      cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
      blocks: 1,
    });
    await c1.execute(charlie.getDepositAddress());

    expect(await charlie.getBalance("sat")).toBeGreaterThan(605);
    expect(await bob.getBalance("sat")).toBeGreaterThan(1000000-1200);
    expect(c1.isTestnet()).toEqual(true);
    expect(await c1.getBalance()).toBe(0n);
  });

});