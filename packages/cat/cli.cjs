#!/usr/bin/env node
require("ts-node/dist/bin").main([
  "--esm",
  `${__dirname}/src/run.ts`,
  ...process.argv.slice(2),
]);
