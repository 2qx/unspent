import { Annuity } from "./annuity/Annuity.js";
import { Divide } from "./divide/Divide.js";
import { Perpetuity } from "./perpetuity/Perpetuity.js";

import { getAnAliceWallet } from "../test/aliceWallet4test.js";

describe(`Generate BitAuth Links Tests`, () => {
  
  test("Should cat a annuity v2 debug link", async () => {
    const payee = "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n";
    const options = { version: 2, network: "regtest" };
    const d1 = new Annuity(1n, payee, 10000n, 1500n, options);

    const alice = await getAnAliceWallet(102000);

    await alice.send([
      {
        cashaddr: d1.getAddress(),
        value: 41200,
        unit: "sat",
      },
      {
        cashaddr: d1.getAddress(),
        value: 41200,
        unit: "sat",
      },
    ]);

    expect(await d1.getBalance()).toBeGreaterThan(100);

    let link = await d1.execute(undefined, undefined, undefined, true);
    //console.log(link)
    expect(link.length).toBeGreaterThan(100);

  });

  test("Should cat a division v2 debug link", async () => {
    const payees = [
      "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
      "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
    ];
    const options = { version: 2, network: "regtest" };
    const d1 = new Divide(1200n, payees, options);

    const alice = await getAnAliceWallet(102000);

    await alice.send([
      {
        cashaddr: d1.getAddress(),
        value: 41200,
        unit: "sat",
      },
      {
        cashaddr: d1.getAddress(),
        value: 41200,
        unit: "sat",
      },
    ]);

    expect(await d1.getBalance()).toBeGreaterThan(100);

    let link = await d1.execute(undefined, undefined, undefined, true);
    //console.log(link)
    expect(link.length).toBeGreaterThan(100);

  });

  test("Should cat a perpetuity v2 debug link", async () => {
    const payee = "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n";
    const options = { version: 2, network: "regtest" };
    const d1 = new Perpetuity(1n, payee, 1500n, 2n, options);

    const alice = await getAnAliceWallet(102000);

    await alice.send([
      {
        cashaddr: d1.getAddress(),
        value: 41200,
        unit: "sat",
      }
    ]);

    expect(await d1.getBalance()).toBeGreaterThan(100);

    let link = await d1.execute(undefined, undefined, undefined, true);
    //console.log(link)
    expect(link.length).toBeGreaterThan(100);

  });
});
