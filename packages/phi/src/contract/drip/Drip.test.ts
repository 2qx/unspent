import { Drip } from "./Drip.js";
import { RegTestWallet, mine } from "mainnet-js";
import { deriveLockingBytecodeHex } from "../../common/util.js";
import { getAnAliceWallet } from "../../test/aliceWallet4test.js";

describe(`Drip Class Tests`, () => {
  test("Should serialize a faucet (v3)", async () => {
    let f = new Drip({version:3});
    let chk = deriveLockingBytecodeHex(f.getAddress());
    expect(f.toString()).toContain(chk);
    expect(f.toString()).toEqual(`$,3,${chk}`);

    let f3 = Drip.fromString(f.toString());

    expect(f.toString()).toEqual(f3.toString());
    expect(f.toOpReturn()).toEqual(f3.toOpReturn());
    expect(f.toOpReturn()).toEqual(Drip.fromOpReturn(f3.toOpReturn()).toOpReturn());
    expect(f.getAddress()).toEqual(f3.getAddress());
    expect(f.isTestnet()).toEqual(f3.isTestnet());
  });

  test("Should deserialize and reserialize a chipnet faucet", async () => {
    let f = new Drip({ version: 3, network: "chipnet" });

    let f2 = Drip.fromString(f.toString(), "chipnet");

    expect(f.toString()).toEqual(f2.toString());
    expect(f.getAddress()).toEqual(f2.getAddress());
    expect(f.isTestnet()).toEqual(f2.isTestnet());
  });

  test("Should deserialize and reserialize a regtest Drip to chunks and from an opreturn", async () => {
    let options = { version: 3, network: "regtest" };
    let f1 = new Drip(options);
    let opReturn = f1.toOpReturn();
    let f2 = Drip.fromOpReturn(opReturn, "regtest");
    expect(f1.toString()).toEqual(f2.toString());
    expect(f2.isTestnet()).toEqual(true);
    expect(f1.getAddress()).toEqual(f2.getAddress());
  });

  test("Should return info", async () => {
    let options = { version: 3, network: "regtest" };
    let f1 = new Drip(options);
    let info = await f1.info(false);
    expect(info).toContain(f1.toString());
    expect(info).toContain("balance");
  });

  test("Should return mainnet info", async () => {
    let options = { version: 3};
    let f1 = new Drip(options);
    let info = await f1.info(false);
    expect(info).toContain(f1.toString());
    expect(f1.getAddress()).toBe("bitcoincash:pwsu8f4ftnsugunzy8wruhuayvtpz9mt88euwvwtp5jvv58wnd95c0td3wpdp");
    expect(info).toContain("balance");
  });


  test("Should drip the faucet (v3) to completion", async () => {
    let options = { version: 3, network: "regtest" };
    let f1 = new Drip(options);

    const alice = await getAnAliceWallet(35000000);
    const bob = await RegTestWallet.newRandom();
    const charlie = await RegTestWallet.newRandom();

    await alice.send([
      {
        cashaddr: f1.getAddress(),
        value: 150000,
        unit: "satoshis",
      },
      {
        cashaddr: f1.getAddress(),
        value: 140000,
        unit: "satoshis",
      },
    ]);
    await mine({
        cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
        blocks: 1,
      });

    for (let x = 0; x < 6; x++) {
        await mine({
            cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
            blocks: 1,
          });
      await f1.execute();
    }

    expect(f1.isTestnet()).toEqual(true);
    expect(await f1.getBalance()).toBeGreaterThan(0n);


  });

});

