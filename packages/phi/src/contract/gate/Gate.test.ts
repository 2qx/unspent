import { mine, RegTestWallet, delay } from "mainnet-js";
import { Gate } from "./Gate.js";
import { derivePublicKeyHashHex } from "../../common/util.js";

describe.skip(`Gate Class Tests`, () => {
  test("Should a serialize a Gate", async () => {
    let g = new Gate(
      6000n,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      1000n
    );
    let chk = derivePublicKeyHashHex(
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr"
    );
    expect(g.toString()).toContain(chk);
    expect(g.toString()).toEqual(
      "G,1,6000,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787,1000,a9146c93d07a3b946446767d02774646e484f88e1f2987"
    );

    let g2 = Gate.fromString(g.toString());

    expect(g.toString()).toEqual(g2.toString());
    expect(g.getAddress()).toEqual(g2.getAddress());
    expect(g.isTestnet()).toEqual(g2.isTestnet());
  });

  test("Should a deserialize and reserialize a chipnet Gate", async () => {
    let options = { version: 1, network: "chipnet" };
    let g = new Gate(
      5000n,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      2000n,
      options
    );

    let g2 = Gate.fromString(g.toString(), "chipnet");

    expect(g.toString()).toEqual(g2.toString());
    expect(g.getAddress()).toEqual(g2.getAddress());
    expect(g.isTestnet()).toEqual(g2.isTestnet());
  });

  test("Should a deserialize and reserialize a regtest Gate to and from an opreturn", async () => {
    let options = { version: 1, network: "regtest" };
    let g1 = new Gate(
      5000n,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      2000n,
      options
    );
    let opReturn = g1.toOpReturn();
    let g2 = Gate.fromOpReturn(opReturn, "regtest");
    expect(g1.toString()).toEqual(g2.toString());
    expect(g2.isTestnet()).toEqual(true);
    expect(g1.getAddress()).toEqual(g2.getAddress());
  });

});