import { opReturnToInstance } from "./map.js";
import { Faucet } from "../contract/faucet/Faucet.js";
import { Record } from "../contract/record/Record.js";
import { PROTOCOL_ID } from "./constant.js";

describe(`Test mapping serialized contracts`, () => {
  test("Should deserialize contract from opReturn hex", async () => {
    const r = new Faucet();
    const recordOpReturn = r.toOpReturn(true);
    const r2 = opReturnToInstance(recordOpReturn)!;
    expect(r.toString()).toBe(r2.toString());
  });

  test("Should deserialize contract from opReturn binary", async () => {
    const r = new Record();
    const recordOpReturn = r.toOpReturn();
    const r2 = opReturnToInstance(recordOpReturn)!;
    expect(r.toString()).toBe(r2.toString());
  });

  test("Should parse some opReturn hex", async () => {
    const vectors = [
      "6a04" +
        PROTOCOL_ID +
        "01520101025203010017a91496e199d7ea23fb779f5764b97196824002ef811a87",
    ];

    for (let v of vectors) {
      const r2 = opReturnToInstance(v)!;
      expect(r2.toString()).toBe(
        "R,1,850,0,a91496e199d7ea23fb779f5764b97196824002ef811a87"
      );
    }
  });

  test("Should parse some opReturn hex", async () => {
    const vectors = [
      new Record().toOpReturn(true),
      new Faucet().toOpReturn(true),
    ];
    const opcodes = [
      "6a047574786f01520101025203010017a91496e199d7ea23fb779f5764b97196824002ef811a87",
      "6a047574786f01460101010102e803010117a914ef026fd206617299133c358dd0518561f2fc6d6887",
    ];

    const strings = [
      "R,1,850,0,a91496e199d7ea23fb779f5764b97196824002ef811a87",
      "F,1,1,1000,1,a914ef026fd206617299133c358dd0518561f2fc6d6887",
    ];

    for (let v of vectors) {
      const i = opReturnToInstance(v);
      const idx = vectors.indexOf(v);
      if (i) {
        expect(i.toString()).toBe(strings[idx]);
        expect(v).toBe(opcodes[idx]);
      } else {
        console.log(`Failed to parse ${v}`);
      }
    }
  });
});
