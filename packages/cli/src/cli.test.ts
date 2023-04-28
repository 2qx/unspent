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
# A,1,4000,a914ef026fd206617299133c358dd0518561f2fc6d6887,1200,3400,a91408e36102f1041ff1eb9d6ba47fcfb7f7d404cb7b87
address:        bitcoincash:pqywxcgz7yzplu0tn446gl70klmagpxt0vf2wnsljg`
    let r = await mockCall(["annuity", "--address", "bitcoincash:prhsym7jqesh9xgn8s6cm5z3s4sl9lrddqjgxav6s8", "--installment", "1200"])
    expect(r[0][0]).toContain(ex);
  });


  test("Should print info for default faucet", async () => {

    let ex = `# A faucet paying 1000 (sat), every 1 blocks
# F,1,1,1000,1,a914ef026fd206617299133c358dd0518561f2fc6d6887
address:        bitcoincash:prhsym7jqesh9xgn8s6cm5z3s4sl9lrddqjgxav6s8`
    let r = await mockCall(["faucet"])
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
# F,1,1,1000,1,a914ef026fd206617299133c358dd0518561f2fc6d6887
address:        bchreg:prhsym7jqesh9xgn8s6cm5z3s4sl9lrddqvx5md75a`
    let r = await mockCall(["faucet", "--regtest"])
    expect(r[0][0]).toContain(ex);

  });


  test("Should show info for default record contract", async () => {
    let ex = `# Recording contract with up to 850 per broadcast, index 0
# R,1,850,0,a91496e199d7ea23fb779f5764b97196824002ef811a87
address:        bchtest:pztwrxwhag3lkaul2ajtjuvksfqq9muprgcmvkz5sw`
    let r = await mockCall(["record", "--chipnet"])
    expect(r[0][0]).toContain(ex);
  });

  test("Should execute divide contract", async () => {
    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    await alice.send([
      {
        cashaddr: "bchreg:ppmxmh7afst9af6pwdwkhtna848ufwc69ql3en0v3f",
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
    ])
    
    let r = await mockCall(["record", "--regtest", "--contract", "R,1,850,0,a91496e199d7ea23fb779f5764b97196824002ef811a87"])
    expect(r[0][0]).toContain("broadcasting... ");
    // should return a transaction hash
    expect(r[1][0]).toMatch(/[0-f]{64}/);
  });


  test("Should query contract info", async () => {
    let r = await mockCall(["query", "--prefix", "6a047574786f01460101010002e502"])
    expect(r[0][0]).toContain("Found 1 records");
  });

});