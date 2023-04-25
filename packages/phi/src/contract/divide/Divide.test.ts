import { opReturn } from "@bitauth/libauth";
import { RegTestWallet } from "mainnet-js";
import { Divide } from "./Divide.js";
import {
  derivePublicKeyHashHex,
  createOpReturnData,
  decodeNullDataScript,
} from "../../common/util.js";

describe(`Divide Class Tests`, () => {
  test("Should serialize a Divider", async () => {
    const payees = [
      "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
      "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
      "bchreg:qr83275dydrynk3s2rskr3g2mh34eu88pqar07tslm",
      "bchreg:qzdf6fnhey0wul647j2953svsy7pjfn98s28vgv2ss",
    ];
    const options = { version: 1, network: "regtest" };
    const a = new Divide(4000n, payees, options);
    const chk = derivePublicKeyHashHex(a.getAddress());
    expect(a.toString()).toContain(chk);
    expect(a.toString()).toContain(`D,1,4000`);
    const a2 = Divide.fromString(a.toString(), options.network);
    expect(a.toString()).toEqual(a2.toString());
    expect(a.getAddress()).toEqual(a2.getAddress());
    expect(a.isTestnet()).toEqual(a2.isTestnet());
  });

  test("Should deserialize and reserialize a chipnet Divider", async () => {
    const payees = [
      "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
      "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
      "bchreg:qr83275dydrynk3s2rskr3g2mh34eu88pqar07tslm",
      "bchreg:qzdf6fnhey0wul647j2953svsy7pjfn98s28vgv2ss",
    ];
    const options = { version: 1, network: "chipnet" };
    const a = new Divide(3000n, payees, options);
    const chk = derivePublicKeyHashHex(a.getAddress());
    expect(a.toString()).toContain(chk);
    const a2 = Divide.fromString(a.toString(), "chipnet");
    expect(a.toString()).toEqual(a2.toString());
    expect(a.getAddress()).toEqual(a2.getAddress());
    expect(a.isTestnet()).toEqual(a2.isTestnet());
    expect(a.isTestnet()).toEqual(true);
  });

  test("Should deserialize and reserialize a regtest Divider to chunks and opreturn", async () => {
    const payees = [
      "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
      "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
      "bchreg:qr83275dydrynk3s2rskr3g2mh34eu88pqar07tslm",
      "bchreg:qzdf6fnhey0wul647j2953svsy7pjfn98s28vgv2ss",
    ];
    const options = { version: 1, network: "regtest" };
    const d1 = new Divide(3000n, payees, options);
    const opReturn = d1.toOpReturn();
    const d2 = Divide.fromOpReturn(opReturn, "regtest");
    expect(d1.toString()).toEqual(d2.toString());
    expect(d2.isTestnet()).toEqual(true);
    expect(d1.getAddress()).toEqual(d2.getAddress());
  });

  test("Should deserialize and reserialize a regtest Divider to chunks and opreturn", async () => {
    const payees = [
      "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
      "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
      "bchreg:qr83275dydrynk3s2rskr3g2mh34eu88pqar07tslm",
      "bchreg:qzdf6fnhey0wul647j2953svsy7pjfn98s28vgv2ss",
    ];
    const options = { version: 1, network: "regtest" };
    const d1 = new Divide(3000n, payees, options);
    const opReturn = d1.toOpReturn();
    const d2 = Divide.fromOpReturn(opReturn, "regtest");
    expect(d1.toString()).toEqual(d2.toString());
    expect(d2.isTestnet()).toEqual(true);
    expect(d1.getAddress()).toEqual(d2.getAddress());
  });

  test("Should pay a division contract", async () => {
    const payees = [
      "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
      "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
      "bchreg:qr83275dydrynk3s2rskr3g2mh34eu88pqar07tslm",
      "bchreg:qzdf6fnhey0wul647j2953svsy7pjfn98s28vgv2ss",
    ];
    const options = { version: 1, network: "regtest" };
    const d1 = new Divide(1200n, payees, options);

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);

    await alice.send([
      {
        cashaddr: d1.getAddress(),
        value: 41200,
        unit: "sat",
      },
    ]);

    expect(await d1.getBalance()).toBeGreaterThan(100);

    const response = await d1.execute();

    const receipt = await RegTestWallet.watchOnly(
      "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n"
    );
    expect(await receipt.getBalance("sat")).toBeGreaterThan(10000);
  });

  test("Should deserialize Divider outputs", async () => {
    const payees = [
      "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
      "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
      "bchreg:qr83275dydrynk3s2rskr3g2mh34eu88pqar07tslm",
      "bchreg:qzdf6fnhey0wul647j2953svsy7pjfn98s28vgv2ss",
    ];
    const options = { version: 1, network: "regtest" };
    const a = new Divide(4000n, payees, options);
    const chk = derivePublicKeyHashHex(a.getAddress());
    const outputs = Divide.parseOutputs(a.toOpReturn())
    expect(outputs.length).toBe(5);
  });

  test("Should pay division contract to P2SH addresses", async () => {
    const options = { version: 1, network: "regtest" };

    // faucets 0-3
    const payees = [
      "bchreg:pzqsz2t07725tp0x5s88pufmzapr3n39rsr7s0sgq4",
      "bchreg:pr9ye5xfn0kqd3cvsvpsjnhnp6y8ytv87uvrsactvf",
      "bchreg:pqe3hshcgz7vyhwlgq7p623e5wt053te5c6l2gk4yt",
      "bchreg:pre45xaukxxkznm38lmke28n094c9gya8gj2yuy2ys",
    ];
    const d1 = new Divide(1200n, payees, options);

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);

    await alice.send([
      {
        cashaddr: d1.getAddress(),
        value: 41200,
        unit: "sat",
      },
    ]);

    expect(await d1.getBalance()).toBeGreaterThan(100);

    const response = await d1.execute(alice.getDepositAddress());

    const receipt = await RegTestWallet.watchOnly(payees[0]);

    expect(await receipt.getBalance("sat")).toBeGreaterThan(10000);
    // ...
  });

  test("Should pay division contract to two P2SH addresses", async () => {
    const options = { version: 1, network: "regtest" };

    // faucets 0-3
    const payees = [
      "bchreg:pzqsz2t07725tp0x5s88pufmzapr3n39rsr7s0sgq4",
      "bchreg:pr9ye5xfn0kqd3cvsvpsjnhnp6y8ytv87uvrsactvf",
    ];
    const d1 = new Divide(1200n, payees, options);

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);

    await alice.send([
      {
        cashaddr: d1.getAddress(),
        value: 41200,
        unit: "sat",
      },
    ]);

    expect(await d1.getBalance()).toBeGreaterThan(100);

    const response = await d1.execute(alice.getDepositAddress());

    const receipt = await RegTestWallet.watchOnly(payees[0]);

    expect(await receipt.getBalance("sat")).toBeGreaterThan(10000);
    // ...
  });

  test("Should return info", async () => {
    const options = { version: 1, network: "regtest" };
    const payees = [
      "bchreg:pzqsz2t07725tp0x5s88pufmzapr3n39rsr7s0sgq4",
      "bchreg:pr9ye5xfn0kqd3cvsvpsjnhnp6y8ytv87uvrsactvf",
      "bchreg:pqe3hshcgz7vyhwlgq7p623e5wt053te5c6l2gk4yt",
      "bchreg:pre45xaukxxkznm38lmke28n094c9gya8gj2yuy2ys",
    ];
    const c1 = new Divide(1200n, payees, options);
    const info = await c1.info(false);
    expect(info).toContain(c1.toString());
    expect(info).toContain("balance");
  });
});
