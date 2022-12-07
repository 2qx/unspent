import { mine, RegTestWallet, delay } from "mainnet-js";
import { Gate } from "./Gate.js";
import { derivePublicKeyHashHex } from "../../common/util.js";

describe(`Perpetuity Class Tests`, () => {
  test("Should a serialize a Perpetuity", async () => {
    let g = new Gate(
      6000,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      1000
    );
    let chk = derivePublicKeyHashHex(
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr"
    );
    expect(g.toString()).toContain(chk);
    expect(g.toString()).toEqual(
      "G,1,6000,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787,1000,a91401f2644ebbda119fb742c1d34be1b38cb7cae88a87"
    );

    let g2 = Gate.fromString(g.toString());

    expect(g.toString()).toEqual(g2.toString());
    expect(g.getAddress()).toEqual(g2.getAddress());
    expect(g.isTestnet()).toEqual(g2.isTestnet());
  });

  test("Should a deserialize and reserialize a staging Gate", async () => {
    let options = { version: 1, network: "staging" };
    let g = new Gate(
      5000,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      2000,
      options
    );

    let g2 = Gate.fromString(g.toString(), "staging");

    expect(g.toString()).toEqual(g2.toString());
    expect(g.getAddress()).toEqual(g2.getAddress());
    expect(g.isTestnet()).toEqual(g2.isTestnet());
  });

  test("Should a deserialize and reserialize a regtest Gate to and from an opreturn", async () => {
    let options = { version: 1, network: "regtest" };
    let g1 = new Gate(
      5000,
      "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",
      2000,
      options
    );
    let opReturn = g1.toOpReturn();
    let g2 = Gate.fromOpReturn(opReturn, "regtest");
    expect(g1.toString()).toEqual(g2.toString());
    expect(g2.isTestnet()).toEqual(true);
    expect(g1.getAddress()).toEqual(g2.getAddress());
  });

});