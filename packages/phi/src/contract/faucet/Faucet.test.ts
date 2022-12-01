import { Faucet } from "./Faucet.js";
import { RegTestWallet, mine } from "mainnet-js";
import { deriveLockingBytecodeHex } from "../../common/util.js";

describe(`Faucet Class Tests`, () => {
  test("Should serialize a faucet", async () => {
    let f = new Faucet();
    let chk = deriveLockingBytecodeHex(f.getAddress());
    expect(f.toString()).toContain(chk);
    expect(f.toString()).toEqual(`F,1,1,1000,1,${chk}`);

    let f2 = Faucet.fromString(f.toString());

    expect(f.toString()).toEqual(f2.toString());
    expect(f.getAddress()).toEqual(f2.getAddress());
    expect(f.isTestnet()).toEqual(f2.isTestnet());
  });

  test("Should deserialize and reserialize a staging faucet", async () => {
    let f = new Faucet(5, 3000, 2, { version: 1, network: "staging" });

    let f2 = Faucet.fromString(f.toString(), "staging");

    expect(f.toString()).toEqual(f2.toString());
    expect(f.getAddress()).toEqual(f2.getAddress());
    expect(f.isTestnet()).toEqual(f2.isTestnet());
  });

  test("Should deserialize and reserialize a regtest Faucet to chunks and from an opreturn", async () => {
    let options = { version: 1, network: "regtest" };
    let f1 = new Faucet(5, 3000, 2, options);
    let opReturn = f1.toOpReturn();
    let f2 = Faucet.fromOpReturn(opReturn, "regtest");
    expect(f1.toString()).toEqual(f2.toString());
    expect(f2.isTestnet()).toEqual(true);
    expect(f1.getAddress()).toEqual(f2.getAddress());
  });

  test("Should return info", async () => {
    let options = { version: 1, network: "regtest" };
    let f1 = new Faucet(5, 3000, 2, options);
    let info = await f1.info(false);
    expect(info).toContain(f1.toString());
    expect(info).toContain("balance");
  });
});
