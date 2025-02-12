import { mine, RegTestWallet } from "mainnet-js";
import { Annuity } from "./Annuity.js";
import { binToHex } from "@bitauth/libauth";
import { DUST_UTXO_THRESHOLD } from "../../common/constant.js";
import { derivePublicKeyHashHex } from "../../common/util.js";
import { getAnAliceWallet } from "../../test/aliceWallet4test.js"; 

describe(`Annuity Class Tests`, () => {
  test("Should serialize a Annuity", async () => {
    const a = new Annuity(
      4000n,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      5000n,
      Annuity.minAllowance,
      {version:2}
    );
    const chk = derivePublicKeyHashHex(
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr"
    );
    expect(a.toString()).toContain(chk);
    expect(a.toString()).toEqual(
      "A,2,4000,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787,5000,838,aa20d33b1f95be99b9246816d870567e405e17734e3dc76e7ff68fc274ad4bfe14d487"
    );
    const a2 = Annuity.fromString(a.toString());
    expect(a.toString()).toEqual(a2.toString());
    expect(a.getAddress()).toEqual(a2.getAddress());
    expect(a.isTestnet()).toEqual(a2.isTestnet());
  });

  test("Should deserialize and reserialize a regtest Annuity", async () => {
    const a = new Annuity(
      5n,
      process.env["ADDRESS"]!,
      5000n,
      Annuity.minAllowance,
      {
        version: 2,
        network: "regtest",
      }
    );
    const a2 = Annuity.fromString(a.toString(), "regtest");
    expect(a.toString()).toEqual(a2.toString());
    expect(a.getAddress()).toEqual(a2.getAddress());
    expect(a.isTestnet()).toEqual(a2.isTestnet());
  });

  test("Should error on next version ", async () => {
    try {
      new Annuity(5n, process.env["ADDRESS"]!, 5000n, Annuity.minAllowance, {
        version: 3,
        network: "regtest",
      });
    } catch (e) {
      expect(e).toEqual(Error("Unrecognized Annuity Version"));
    }
  });

  test("Should deserialize and reserialize a regtest Annuity to chunks and opreturn", async () => {
    const options = { version: 2, network: "regtest" };
    const a1 = new Annuity(
      5n,
      process.env["ADDRESS"]!,
      5000n,
      Annuity.minAllowance,
      options
    );
    const opReturn = a1.toOpReturn(false);
    const a2 = Annuity.fromOpReturn(opReturn, "regtest");
    const ex = Annuity.getExecutorAllowance(opReturn, "regtest");
    expect(ex).toBe(Annuity.minAllowance);
    expect(a1.toString()).toEqual(a2.toString());
    expect(a2.isTestnet()).toEqual(true);
    expect(a1.getAddress()).toEqual(a2.getAddress());
  });

  test("Should a return info", async () => {
    const options = { version: 2, network: "regtest" };
    const c1 = new Annuity(
      5n,
      process.env["ADDRESS"]!,
      5000n,
      Annuity.minAllowance,
      options
    );
    const info = await c1.info(false);
    expect(info).toContain(c1.toString());
    expect(info).toContain("balance");
  });

  test("Should pay an annuity", async () => {
    const alice = await getAnAliceWallet(1200000);
    const bob = await RegTestWallet.newRandom();
    const charlie = await RegTestWallet.newRandom();

    const options = { version: 2, network: "regtest" };
    const p1 = new Annuity(
      0n,
      bob.getDepositAddress(),
      5000n,
      1500n,
      options
    );

    // fund the contract
    
    await alice.send([
      {
        cashaddr: p1.getAddress(),
        value: 19500,
        unit: "satoshis",
      },
      {
        cashaddr: p1.getAddress(),
        value: 13000,
        unit: "satoshis",
      },
    ]);

    for (let x = 0; x < 5; x++) {
      await p1.execute(charlie.getDepositAddress());
    }

    expect(await charlie.getBalance("sat")).toBeGreaterThan(3000);
    expect(await bob.getBalance("sat")).toBeGreaterThan(25000);
    expect(p1.isTestnet()).toEqual(true);
    expect(await p1.getBalance()).toBe(0n);
  });
});
