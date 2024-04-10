
// @ts-ignore
import packageJson from "../package.json" assert { type: "json" };

import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import util from "node:util";
const execPromise = util.promisify(exec);


import "fake-indexeddb/auto";
import dotenv from 'dotenv';

import { default as SqlProvider } from "./db.js";
import { default as pgp } from "pg-promise";
import { getBlockHistory, getPriceHistory } from "./query.js";
import { getRegularSeries } from "./timeseries.js";


import { Cli, Command, Option } from "clipanion";

import {
  Perpetuity
} from "@unspent/phi";

import {
  parseBigInt,
  opReturnToSerializedString,
  opReturnToBalance,
  getDefaultElectrumProvider,
  stringToInstance,
} from "@unspent/phi";

import {
  getRecords
} from "@unspent/psi";

import { lockingBytecodeToCashAddress, hexToBin } from "@bitauth/libauth";

abstract class VersionedCommand extends Command {
  version = Option.String("--version", "2", {
    description: "The unspent/phi contract version",
  });
}

abstract class NetworkCommand extends VersionedCommand {
  isChipnet = Option.Boolean("--chipnet", false, {
    description: "Use chipnet",
  });
  isRegtest = Option.Boolean("--regtest", false,
    {
      description: "Use a regtest network",
    });
}

export class CacheCommand extends Command {
  static override usage = Command.Usage({
    category: `Utility`,
    description: `Cache timeseries as json`,
  });
  file = Option.String("--file", {
    required: false,
    description: "The file path to write json to",
  });

  static override paths = [[`cache`], [`c`]];

  async execute() {
    dotenv.config()
    let db = new SqlProvider('mainnet');
    await db.init();

    let phiFile = !this.file ? "../../packages/app/static/stats.json" : this.file;
    let chiFile = !this.file ? "../../packages/chi/static/stats.json" : this.file;
    let chiPath = path.join(path.dirname(""), chiFile)
    let phiPath = path.join(path.dirname(""), phiFile)
    let results = await db.getTlv();
    fs.writeFile(chiPath, JSON.stringify(results, null, 4), (err) => {
      if (err) {
        console.error(err);
        return;
      };
    });
    fs.writeFile(phiPath, JSON.stringify(results, null, 4), (err) => {
      if (err) {
        console.error(err);
        return;
      };
    });
  }

}

export class SaveCommand extends NetworkCommand {
  static override usage = Command.Usage({
    category: `Utility`,
    description: `Update time-series records`,
  });

  static override paths = [[`save`], [`s`]];
  async execute() {
    dotenv.config()

  }
}


export class UpdateCommand extends NetworkCommand {
  static override usage = Command.Usage({
    category: `Utility`,
    description: `Update time-series records`,
  });

  static override paths = [[`update`], [`u`]];

  network = this.isChipnet ? "chipnet" : this.isRegtest ? "regtest" : "mainnet";
  chaingraph = Option.String("--chaingraph", {
    required: false,
    description: "A chaingraph service to query",
  });
  prefix = Option.String("--prefix", {
    required: false,
    description: "The contract prefix in hex",
  });
  offset = Option.String("--offset", {
    required: false,
    description: "starting index of records returned",
  });
  limit = Option.String("--limit", {
    required: false,
    description: "The maximum number of records returned, (25 default)",
  });

  async execute() {
    dotenv.config()
    let db = new SqlProvider('mainnet');
    await db.init();

    let prices = await getPriceHistory();

    console.log("updating price history...")
    await db.putFiatHistory(prices);

    console.log("syncing block timestamps...")
    await db.syncBlockHistory();


    let chaingraph = this.chaingraph
      ? this.chaingraph
      : "https://demo.chaingraph.cash/v1/graphql";
    let prefix = this.prefix ? this.prefix : "6a047574786f01";

    let node = this.isChipnet ? "chipnet" : this.isRegtest ? "rbchn" : "mainnet";
    let networkProvider = getDefaultElectrumProvider(node)
    let limit = !this.limit ? 50 : parseInt(this.limit);
    let offset = !this.offset ? 0 : parseInt(this.offset);
    let exclude = "6a0401010102010717"
    let hexRecords = [];
    while (true) {
      try {
        let tmpRecords = await getRecords(chaingraph, prefix, node, limit, offset, exclude);
        hexRecords.push(...tmpRecords)
        if (tmpRecords.length == 0) break;
        console.log(tmpRecords.length)
      } catch {
        console.log(`Error getting records at offset ${offset}`)
      }

      offset += 50
    }
    let contracts = [];
    let total = 0n;
    console.log(`found ${hexRecords.length} records`);
    console.log(hexRecords)
    for (let record of hexRecords) {

      try {
        let instance = opReturnToSerializedString(record, this.network);
        if (instance) contracts.push(instance.toString());
        //@ts-ignore
        let subTotal = await opReturnToBalance(record, this.network, networkProvider)
        if (instance && instance[0] != 'F') {
          let prefix = this.isChipnet ? 'bchtest' : 'bitcoincash' as "bchtest" | "bitcoincash" | "bchreg" | undefined
          let lockingBytecode = instance.split(",").pop() as string

          let contractAddr = lockingBytecodeToCashAddress(hexToBin(lockingBytecode), prefix)
          if (Number(subTotal) > 0) {
            try {
              await db.syncOutputHistory(lockingBytecode)
            } catch {
              console.log(`Error posting outputs for ${contractAddr}`)
            }

            let irregularTs = []
            try {
              irregularTs = await db.getIrregularTs(lockingBytecode)
            } catch (error) {
              if (error instanceof pgp.errors.QueryResultError) {
                console.log(`Error getting time-series for ${lockingBytecode}`)
              } else {
                throw (error);
              }
            }

            try {
              let regular = getRegularSeries(irregularTs)
              if (regular.length > 0) await db.putSeries(regular)
            } catch {
              console.log(`Error posting time-series for ${contractAddr}`)
            }


          }
        }
        total += BigInt(subTotal);
        console.log(`${contracts.length} ${total.toLocaleString()} ${record}`)

      } catch (e) {
        console.log(e)
        console.log('Error processing: ', record)
      }


    }

    console.log("sum: ", total.toLocaleString())
    console.log(`Built ${contracts.length} contracts`);

  }
}


const cli = new Cli({
  binaryName: "unspent",
  binaryLabel: "@unspent/cli",
  binaryVersion: packageJson.version,
  enableColors: true,
  enableCapture: true
});


export { cli };