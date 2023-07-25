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
      "6a047574786f01520102028403010023aa20da6c45b82d1b5320797fcf37005ec2d5d23c9823aecb36fc21cb71cb16f49c7887",
      "6a047574786f01460102010102e803010123aa204cc47326322f08cf87cbbfa23c02f5e0c8efa97b63c04709cb3a3b5fe434988987",
    ];

    const strings = [
      "R,2,900,0,aa20da6c45b82d1b5320797fcf37005ec2d5d23c9823aecb36fc21cb71cb16f49c7887",
      "F,2,1,1000,1,aa204cc47326322f08cf87cbbfa23c02f5e0c8efa97b63c04709cb3a3b5fe434988987",
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
