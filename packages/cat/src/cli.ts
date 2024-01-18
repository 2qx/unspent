
// @ts-ignore
import packageJson from "../package.json" assert { type: "json" };

import "fake-indexeddb/auto";
import dotenv from 'dotenv';

import { default as SqlProvider } from "./db.js";
import { getBlockHistory, getPriceHistory } from "./query.js";

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
import { INCEPTION } from "./config.js";

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

abstract class CustomFeeCommand extends NetworkCommand {
  fee = Option.String("--fee", {
    required: false,
    description: "transaction fee override",
  });
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
    let prefix = this.prefix ? this.prefix : "6a047574786f015001";

    let node = this.isChipnet ? "chipnet" : this.isRegtest ? "rbchn" : "mainnet";
    let networkProvider = getDefaultElectrumProvider(node)
    let limit = !this.limit ? 200 : parseInt(this.limit);
    let offset = !this.offset ? undefined : parseInt(this.offset);
    let exclude = "6a047574786f014d0101"
    let hexRecords = await getRecords(chaingraph, prefix, node, limit, offset, exclude);
    let contracts = [];
    let total = 0n;
    for (let record of hexRecords) {
      try {
        let instance = opReturnToSerializedString(record, this.network);

        if (instance) contracts.push(instance.toString());
        //@ts-ignore
        let subTotal = await opReturnToBalance(record, this.network, networkProvider)
        if (instance) {
          let prefix = this.isChipnet ? 'bchtest' : 'bitcoincash' as "bchtest" | "bitcoincash" | "bchreg" | undefined
          let lockingBytecode = instance.split(",").pop() as string
          
          let contractAddr = lockingBytecodeToCashAddress(hexToBin(lockingBytecode), prefix)
          console.log(Number(subTotal), instance, contractAddr)
          if (Number(subTotal) > 0) await db.syncOutputHistory(lockingBytecode)
        }
        total += BigInt(subTotal);

      } catch (e) {
        console.log(e)
        //anyone can post an OP_RETURN that doesn't parse
        console.log('couldn\'t parse: ', record)
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