import { expect, jest, test } from '@jest/globals';
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
    jest.restoreAllMocks()
  });

  test("No op test", async () => {

    expect(cli.binaryName).toBe("unspent");
    expect(cli.binaryLabel).toBe("@unspent/cli");
    expect(cli.binaryVersion).toBe(packageJson.version);
  });

  test("Test Help", async () => {
    expect(cli.process([`-h`]).path).toStrictEqual([`-h`]);
  });

  test("Test Annuity Defaults", async () => {

    jest.spyOn(console, 'log');
    await runCli(cli, ["annuity","--address","bitcoincash:prhsym7jqesh9xgn8s6cm5z3s4sl9lrddqjgxav6s8","--installment","1200"])
    expect(jest.mocked(console.log).mock.calls).toEqual([
      [
        `# Annuity paying 1200 (sat), every 4000 blocks, after a 3400 (sat) executor allowance
# A,1,4000,a914ef026fd206617299133c358dd0518561f2fc6d6887,1200,3400,a91408e36102f1041ff1eb9d6ba47fcfb7f7d404cb7b87
address:        bitcoincash:pqywxcgz7yzplu0tn446gl70klmagpxt0vf2wnsljg
balance:        0
`
      ]
    ]);
  });


  test("Test Faucet Defaults", async () => {

    jest.spyOn(console, 'log');
    await runCli(cli, ["faucet"])
    expect(jest.mocked(console.log).mock.calls).toEqual([
      [
        `# A faucet paying 1000 (sat), every 1 blocks
# F,1,1,1000,1,a914ef026fd206617299133c358dd0518561f2fc6d6887
address:        bitcoincash:prhsym7jqesh9xgn8s6cm5z3s4sl9lrddqjgxav6s8
balance:        546
`
      ]
    ]);
  });

});