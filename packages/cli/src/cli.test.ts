import { expect, jest, test } from '@jest/globals';
import { mine, RegTestWallet } from "mainnet-js";
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
import { runCli } from "./tools.js"
// @ts-ignore
import packageJson from "../package.json" assert { type: "json" };


const sleep = (ms:number) => new Promise( res => setTimeout(res, ms));

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

    let ex = `# Annuity paying 1200 (sat), every 4000 blocks, after a 3400 (sat) executor allowance
# A,2,4000,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787,1200,3400,aa20dad0b02de06cac90cb261463c696352959d75775d991b4b3de737dea96bc125487
address:        bchreg:p0ddpvpdupk2eyxtyc2x835kx554n46hwhverd9nmeehm65khsf9gdhe0gqgh`
    let r = await mockCall(["annuity", "--regtest",  "--address", "bchreg:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwus03a55xe", "--installment", "1200"])
    expect(r[0][0]).toContain(ex);
  });


  test("Should print info for default faucet", async () => {

    let ex = `# A faucet paying 1000 (sat), every 1 blocks
# F,2,1,1000,1,aa204cc47326322f08cf87cbbfa23c02f5e0c8efa97b63c04709cb3a3b5fe434988987
address:        bchreg:pdxvguexxghs3nu8ewl6y0qz7hsv3maf0d3uq3cfevarkhlyxjvgjk6kltems`
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

  test("Should show info for v1 regtest faucet", async () => {

    let ex = `# A faucet paying 1000 (sat), every 1 blocks
# F,2,1,1000,1,aa204cc47326322f08cf87cbbfa23c02f5e0c8efa97b63c04709cb3a3b5fe434988987
address:        bchreg:pdxvguexxghs3nu8ewl6y0qz7hsv3maf0d3uq3cfevarkhlyxjvgjk6kltems`
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
    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
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
    
    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
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
    expect(r[0][0]).toContain("Build 1 contracts");
  });

});