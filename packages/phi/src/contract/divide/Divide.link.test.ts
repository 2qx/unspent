import { Divide } from "./Divide.js";

import { getAnAliceWallet } from "../../test/aliceWallet4test.js";

describe(`Divide Class Tests`, () => {
  
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
    console.log(link)
    expect(link.length).toBeGreaterThan(100);

  });
});
