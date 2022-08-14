#!/usr/bin/env node
require('ts-node/dist/bin').main(['--esm', `${__dirname}/cli.ts`, ...process.argv.slice(2)]);