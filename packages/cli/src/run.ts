#!/usr/bin/env node
import {
  cli,
  AnnuityCommand,
  DivideCommand,
  DripCommand,
  FaucetCommand,
  MineCommand,
  PerpetuityCommand,
  QueryCommand,
  RecordCommand,
} from "./cli.ts"
import { Builtins } from "clipanion"

cli.register(AnnuityCommand);
cli.register(DivideCommand);
cli.register(DripCommand);
cli.register(FaucetCommand);
cli.register(MineCommand);
cli.register(PerpetuityCommand);
cli.register(QueryCommand);
cli.register(RecordCommand);
cli.register(Builtins.VersionCommand);
cli.register(Builtins.HelpCommand);

cli.runExit(process.argv.slice(2));