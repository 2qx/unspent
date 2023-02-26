#!/usr/bin/env node
console.log("unspent-cli");
require("ts-node/dist/bin").main([
  "--esm",
  `${__dirname}/cli.ts`,
  ...process.argv.slice(2),
]);
