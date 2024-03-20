import {
  CacheCommand,
  cli,
  UpdateCommand
} from "./cli.js"
import { Builtins } from "clipanion"

cli.register(CacheCommand);
cli.register(UpdateCommand);
cli.register(Builtins.VersionCommand);
cli.register(Builtins.HelpCommand);
cli.runExit(process.argv.slice(2));