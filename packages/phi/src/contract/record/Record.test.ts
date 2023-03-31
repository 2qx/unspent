import { Record } from "./Record.js";
import { Divide } from "../divide/Divide.js";
import { Faucet } from "../faucet/index.js";
//@ts-ignore
import { RegTestWallet } from "mainnet-js";
import { _PROTOCOL_ID } from "../../common/constant.js";
import { createOpReturnData, decodeNullDataScript } from "../../common/util.js";

describe(`Record Class Tests`, () => {
  test("Should announce itself and Faucet", async () => {
    const options = { version: 1, network: "regtest" };
    const r = new Record(850, 0, options);
    // fund the contract
    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    await alice.send([
      {
        cashaddr: r.getAddress(),
        value: 50000,
        unit: "satoshis",
      },
    ]);

    const tx2 = await r.broadcast();
    expect(r.toOpReturn(true)).toEqual(
      "6a047574786f01520101025203010017a91496e199d7ea23fb779f5764b97196824002ef811a87"
    );
    expect(r.toString()).toEqual(
      "R,1,850,0,a91496e199d7ea23fb779f5764b97196824002ef811a87"
    );
    // expect(tx2.outputs[0]!.lockingBytecode).toStrictEqual(new Uint8Array([
    //     // op return
    //     106,
    //     // 4 byte protocol id
    //     4, 117, 116, 120, 111,
    //     // R
    //     1, 82,
    //     // 1
    //     1, 1,
    //     // 850
    //     2, 82, 3,
    //     // 0
    //     1, 0,
    //     // 0x96e199d7ea23fb779f5764b97196824002ef811a
    //     23,
    //     169, 20,
    //     150, 225, 153, 215, 234, 35, 251, 119, 159, 87,
    //     100, 185, 113, 150, 130, 64, 2, 239, 129, 26,
    //     135
    // ]
    // )
    // )
  });

  test("Should deserialize and reserialize a regtest Record to chunks and from an opreturn", async () => {
    const options = { version: 1, network: "regtest" };
    const r1 = new Record(850, 0, options);
    const opReturn = r1.toOpReturn();
    const r2 = Record.fromOpReturn(opReturn, "regtest");
    expect(r1.toString()).toEqual(r2.toString());
    expect(r2.isTestnet()).toEqual(true);
    expect(r1.getAddress()).toEqual(r2.getAddress());
  });

  test("Should announce itself and Faucet", async () => {
    const options = { version: 1, network: "regtest" };
    const f = new Faucet(1, 1000, 0, options);
    const r = new Record(850, 1, options);

    // fund the contract
    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    await alice.send([
      {
        cashaddr: r.getAddress(),
        value: 50000,
        unit: "satoshis",
      },
    ]);

    const tx = await r.broadcast(f.toOpReturn());
    const tx2 = await r.broadcast();
    // expect(tx2.outputs[0]!.lockingBytecode).toStrictEqual(new Uint8Array(
    //     [
    //         106,
    //         4, 117, 116, 120, 111,
    //         1, 82,
    //         1, 1,
    //         2, 82, 3,
    //         1, 1,
    //         23,
    //         169, 20,
    //         228, 166, 133, 142, 156,
    //         50, 186, 76, 216, 44,
    //         200, 94, 39, 43, 228,
    //         113, 71, 191, 226, 12,
    //         135

    //     ]
    // ))
  });

  test("Should announce itself and Faucet", async () => {
    const payees = [
      "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
      "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
      "bchreg:qr83275dydrynk3s2rskr3g2mh34eu88pqar07tslm",
      "bchreg:qzdf6fnhey0wul647j2953svsy7pjfn98s28vgv2ss",
    ];
    const options = { version: 1, network: "regtest" };
    const d = new Divide(1047, payees, options);
    const r = new Record(Record.minMaxFee, 1, options);

    // fund the contract
    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    await alice.send([
      {
        cashaddr: r.getAddress(),
        value: 50000,
        unit: "satoshis",
      },
    ]);

    const tx = await r.broadcast(d.toOpReturn());
    const tx2 = await r.broadcast();
    // expect(tx2.outputs[0]!.lockingBytecode).toStrictEqual(new Uint8Array(
    //     [
    //         106,
    //         4, 117, 116, 120, 111,
    //         1, 82,
    //         1, 1,
    //         2, 82, 3,
    //         1, 1,
    //         23,
    //         169, 20,
    //         228, 166, 133, 142, 156,
    //         50, 186, 76, 216, 44,
    //         200, 94, 39, 43, 228,
    //         113, 71, 191, 226, 12,
    //         135

    //     ]
    // ))
  });

  test("Should serialize and broadcast a Faucet contract and itself", async () => {
    const options = { version: 1, network: "regtest" };
    const f = new Faucet(1, 3000, 0, options);

    const r = new Record(850, 0, options);
    // fund the contract
    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    await alice.send([
      {
        cashaddr: r.getAddress(),
        value: 50000,
        unit: "satoshis",
      },
    ]);

    const tx = await r.broadcast(f.toOpReturn());
    const aBin = new Uint8Array([106, 4, 117, 116, 120, 111]);

    const payload = new Uint8Array([
      1, 70, 1, 1, 1, 1, 2, 184, 11, 1, 0, 23, 169, 20, 247, 135, 189, 218, 91,
      240, 187, 75, 166, 223, 100, 240, 47, 168, 42, 30, 147, 221, 196, 28, 135,
    ]);
    //expect(opCodeString).toEqual(a)
    // expect(tx.outputs[0]!.lockingBytecode.slice(0,6)).toEqual(aBin)
    // expect(tx.outputs[0]!.lockingBytecode.slice(6,107)).toEqual(payload)
    // const tx2 = await r.broadcast()
    // expect(tx2.outputs[0]!.lockingBytecode).toStrictEqual(new Uint8Array(
    //     [
    //         106,
    //         4,  117,  116, 120, 111,
    //         1,  82,
    //         1,   1,
    //         2,   82,  3,
    //         1,   0,
    //         23,
    //         169, 20,
    //         150, 225, 153, 215, 234,
    //          35, 251, 119, 159,  87,
    //         100, 185, 113, 150, 130,
    //          64,   2, 239, 129,  26,
    //          135
    //       ]
    // ))
  });

  test("Should return info", async () => {
    const options = { version: 1, network: "regtest" };
    const c1 = new Record(850, 0, options);
    const info = await c1.info(false);
    expect(info).toContain(c1.toString());
    expect(info).toContain("balance");
  });

  test("Should return info", async () => {
    const options = { version: 1, network: "staging" };
    const c1 = new Record(850, 1, options);
    const info = await c1.info(false);
    expect(info).toContain(c1.toString());
    expect(info).toContain("balance");
  });
});
