import { expect, jest, test } from '@jest/globals';
import { RegTestWallet } from "mainnet-js";

import { cli } from "../index.js"
import {
  AnnuityCommand,
  DivideCommand,
  FaucetCommand,
  MineCommand,
  PerpetuityCommand,
  QueryCommand,
  RecordCommand,
} from "../index.js"
import { Builtins } from "clipanion";
// @ts-ignore
import packageJson from "../package.json" assert { type: "json" };

export async function getAnAliceWallet(amount: number) : Promise<RegTestWallet> {
  const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
  let newAlice = await RegTestWallet.newRandom();
  await alice.send([
    {
      cashaddr: newAlice.getDepositAddress(),
      value: amount,
      unit: "satoshis",
    },
  ]);
  return newAlice
}


async function mockCall(args: string[]): Promise<any> {
  jest.spyOn(console, 'log');
  await cli.runExit(args)
  
  return jest.mocked(console.log).mock.calls
}

describe(`Text annuity`, () => {

  beforeAll(() => {
    cli.register(AnnuityCommand);
    cli.register(DivideCommand);
    cli.register(FaucetCommand);
    cli.register(MineCommand);
    cli.register(PerpetuityCommand);
    cli.register(QueryCommand);
    cli.register(RecordCommand);
    cli.register(Builtins.VersionCommand);
    cli.register(Builtins.HelpCommand);
  })

  afterEach(() => {
    jest.clearAllMocks()
  });

  test("Asset cli properties", async () => {

    expect(cli.binaryName).toBe("unspent");
    expect(cli.binaryLabel).toBe("@unspent/cli");
    expect(cli.binaryVersion).toBe(packageJson.version);
  });

  test("Test Help", async () => {
    expect(cli.process([`-h`]).path).toStrictEqual([`-h`]);
  });


  test("Should cat default annuity", async () => {

    // 
    let ex = `# Annuity paying 1200 (sat), every 4000 blocks, after a 3400 (sat) executor allowance
# A,2,4000,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787,1200,3400,aa20260865a3a45a8fe581afd9a6edcf1393f8ffbf5745957ea56f8f55290d76f94987
address:        bchreg:pvnqsedr53dglevp4lv6dmw0zwfl3lal2aze2l49d78422gdwmu5jse3yjw8t`
    let r = await mockCall(["annuity", "--regtest",  "--address", "bchreg:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwus03a55xe", "--installment", "1200"])
    expect(r[0][0]).toContain(ex);
  });


  test("Should print info for default faucet", async () => {

    let ex = `# A faucet paying 1000 (sat), every 1 blocks
# F,2,1,1000,1,aa20b82311b5239c9d29a011d3a9603a7cf519b49bdbfd8dac90484f82793f8a6cf187
address:        bchreg:pwuzxyd4ywwf62dqz8f6jcp60n63ndymm07cmtysfp8cy7fl3fk0zggt3v33n`
    let r = await mockCall(["faucet", "--regtest"])
    expect(r[0][0]).toContain(ex);
  });

  test("Should show info for v0 regtest faucet", async () => {

    let ex = `# A faucet paying 1000 (sat), every 1 blocks
# F,0,1,1000,1,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787
address:        bchreg:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwus03a55xe`
    let r = await mockCall(["faucet", "--version", "0", "--regtest"])
    expect(r[0][0]).toContain(ex);

  });

  test("Should show info for v2 regtest faucet", async () => {

    let ex = `# A faucet paying 1000 (sat), every 1 blocks
# F,2,1,1000,1,aa20b82311b5239c9d29a011d3a9603a7cf519b49bdbfd8dac90484f82793f8a6cf187
address:        bchreg:pwuzxyd4ywwf62dqz8f6jcp60n63ndymm07cmtysfp8cy7fl3fk0zggt3v33n`
    let r = await mockCall(["faucet", "--regtest"])
    expect(r[0][0]).toContain(ex);

  });


  test("Should show info for default record contract", async () => {
    let ex = `# Recording contract with up to 900 per broadcast, index 0
# R,2,900,0`
    let r = await mockCall(["record", "--regtest"])
    expect(r[0][0]).toContain(ex);
  });

  test("Should execute divide contract", async () => {
    
    const alice = await getAnAliceWallet(2200000);
    await alice.send([
      {
        cashaddr: "bchreg:p0dxc3dc95d4xgre0l8nwqz7ct2ay0ycywhvkdhuy89hrjck7jw8s8ykx9qge",
        value: 1000000,
        unit: "satoshis",
      },
      {
        cashaddr: "bchreg:pv3z4utv0s3jv5xxhzxmd4ulhllepp2zg7wrmzwj0ykptj8crhysw4myy83a3",
        value: 1000000,
        unit: "satoshis",
      },
    ])
    


    let r2 = await mockCall(["divide", "--regtest", "--addresses", "bchreg:pztwrxwhag3lkaul2ajtjuvksfqq9muprgz86hp8ng,bchreg:pztwrxwhag3lkaul2ajtjuvksfqq9muprgz86hp8ng"])
    expect(r2[0][0]).toMatch(/^[0-f]{64}$/);
  });


  test("Should broadcast contract info", async () => {
    
    const alice = await getAnAliceWallet(2200000);
    await alice.send([
      {
        cashaddr: "bchreg:pztwrxwhag3lkaul2ajtjuvksfqq9muprgz86hp8ng",
        value: 1000000,
        unit: "satoshis",
      },
      {
        cashaddr: "bchreg:pdunt6cjjr9w3psduzl0ukummtc6gn3578j4a5ree090pu9ale6fy5m6eqvq3",
        value: 1000000,
        unit: "satoshis",
      },
    ])
    
    let r = await mockCall(["record", "--regtest", "--contract", "R,1,850,0,a91496e199d7ea23fb779f5764b97196824002ef811a87"])
    expect(r[0][0]).toContain("broadcasting... ");
    // should return a transaction hash
    // expect(r[1][0]).toMatch(/[0-f]{64}/);
  });


  test("Should query contract info", async () => {
    let r = await mockCall(["query",  "--prefix", "6a047574786f01460101010002e502"])
    expect(r[0][0]).toBeGreaterThan(500);
  });

});