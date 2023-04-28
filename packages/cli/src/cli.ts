
// @ts-ignore
import packageJson from "../package.json" assert { type: "json" };

import { Cli, Command, Option } from "clipanion";

import {
  Annuity,
  Divide,
  Faucet,
  Mine,
  Perpetuity,
  Record,
} from "@unspent/phi";

import {
  parseBigInt,
  getRecords,
  opReturnToSerializedString,
  stringToInstance,
} from "@unspent/phi";


abstract class VersionedCommand extends Command{
  version = Option.String("--version", "1", {
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

export class AnnuityCommand extends CustomFeeCommand {
  static override usage = Command.Usage({
    category: `Beneficiary`,
    description: `Regular payments over time`,
  });

  static override paths = [[`annuity`], [`a`]];

  getAddress = Option.Boolean("--deposit", false, {
    description: "give the deposit address for the contract and exit",
  });

  address = Option.String("--address", {
    required: true,
    description:
      "receiving cash address to send coins to, i.e. beneficiary address",
  });
  period = Option.String("--period", {
    required: false,
    description:
      "how often (in blocks) the contract pays (default: 4000, about monthly)",
  });
  allowance = Option.String("--allowance", {
    required: false,
    description:
      "the executor's allowance for miner fees & administration (default: 3400 sats)",
  });
  installment = Option.String("--installment", {
    required: true,
    description: "amount to be paid each period",
  });
  executorAddress = Option.String("--exAddress", {
    required: false,
    description: "address for fee taken by executor for submitting transaction",
  });

  async execute() {
    let network = this.isChipnet
      ? "chipnet"
      : this.isRegtest
      ? "regtest"
      : "mainnet";
    const defaultPeriod = this.isChipnet ? 1n : 4000n;
    let periodInt = !this.period ? defaultPeriod : parseBigInt(this.period);
    let allowanceInt = !this.allowance ? 3400n : parseBigInt(this.allowance);
    let installmentInt = parseBigInt(this.installment);
    let feeOverride = !this.fee ? undefined : parseBigInt(this.fee);
    let version = parseInt(this.version)

    if (!this.getAddress) {
      let a = new Annuity(
        periodInt,
        this.address,
        installmentInt,
        allowanceInt,
        { version: version, network: network }
      );
      await a.info();
      if(await a.isFunded()) a.execute(this.executorAddress, feeOverride);
    } else {
      let a = new Annuity(
        periodInt,
        this.address,
        installmentInt,
        allowanceInt,
        { version: version, network: network }
      );
      await a.info();
    }
  }
}

export class DivideCommand extends CustomFeeCommand {
  static override usage = Command.Usage({
    category: `Beneficiary`,
    description: `Divide money into equal payments, up to four addresses`,
  });

  static override paths = [[`divide`], [`d`]];

  allowance = Option.String("--allowance", {
    required: false,
    description:
      "the executor's allowance for miner fees & administration (default: 1200 sats)",
  });
  addresses = Option.String("--addresses", {
    required: true,
    description:
      "a comma separated list of addresses to receive equal payments",
  });
  executorAddress = Option.String("--exAddress", {
    required: false,
    description: "address for fee taken by executor for submitting transaction",
  });

  async execute() {
    let network = this.isChipnet
      ? "chipnet"
      : this.isRegtest
      ? "regtest"
      : "mainnet";

    let allowanceInt = !this.allowance ? 1200n : parseBigInt(this.allowance);
    let addresses = this.addresses.split(",");
    let feeOverride = !this.fee ? undefined : parseBigInt(this.fee);
    let version = parseInt(this.version)

    let divide = new Divide(allowanceInt, addresses, {
      version: version,
      network: network,
    });
    if ((await divide.getBalance()) > addresses.length * 550) {
      let response = await divide.execute(this.executorAddress, feeOverride);
      console.log(response);
    } else {
      divide.info();
    }
  }
}

export class FaucetCommand extends CustomFeeCommand {
  static override paths = [[`faucet`], [`f`]];

  static override usage = Command.Usage({
    category: `Distributive`,
    description: `Distributes some free bitcoin per period`,
  });

  address = Option.String("--address", {
    required: false,
    description: "receiving address to send coins to, i.e. your address",
  });
  period = Option.String("--period", {
    required: false,
    description: "how often (in blocks) the contract can pay",
  });
  payout = Option.String("--payout", {
    required: false,
    description: "how much the contract pays (satoshi)",
  });
  index = Option.String("--index", {
    required: false,
    description: "a nonce to force uniqueness with identical parameters",
  });

  async execute() {
    let network = this.isChipnet
      ? "chipnet"
      : this.isRegtest
      ? "regtest"
      : "mainnet";

    let periodInt = !this.period ? 1n : parseBigInt(this.period);
    let payoutInt = !this.payout ? 1000n : parseBigInt(this.payout);
    let indexInt = !this.index ? 1n : parseBigInt(this.index);
    let feeOverride = !this.fee ? undefined : parseBigInt(this.fee);
    let version = parseInt(this.version)

    if (this.address) {
      let faucet = new Faucet(periodInt, payoutInt, indexInt, {
        version: version,
        network: network,
      });
      await faucet.info();
      if(await faucet.isFunded()) await faucet.execute(this.address, feeOverride);
    } else {
      let faucet = await new Faucet(periodInt, payoutInt, indexInt, {
        version: version,
        network: network,
      });
      await faucet.info();
    }
  }
}

export class MineCommand extends CustomFeeCommand {
  static override usage = Command.Usage({
    category: `Distributive`,
    description: `Distributes some bitcoin per period, for proof of work`,
  });

  static override paths = [[`mine`], [`m`]];

  getAddress = Option.Boolean("--deposit", false, {
    description: "give the deposit address for the contract and exit",
  });

  period = Option.String("--period", {
    required: false,
    description:
      "how often (in blocks) the contract pays (default: 4000, about monthly)",
  });
  payout = Option.String("--payout", {
    required: false,
    description: "how much the contract pays (satoshi)",
  });
  difficulty = Option.String("--difficulty", {
    required: false,
    description: "Number of zeros required to 'win' block reward",
  });
  canary = Option.String("--canary", {
    required: false,
    description: "random value (hex) the contract was made with",
  });
  executorAddress = Option.String("--exAddress", {
    required: true,
    description: "address for reward",
  });

  async execute() {
    let network = this.isChipnet
      ? "chipnet"
      : this.isRegtest
      ? "regtest"
      : "mainnet";
    const defaultPeriod = this.isChipnet ? 1 : 4000;
    let periodInt = !this.period ? defaultPeriod : parseBigInt(this.period);
    let payoutInt = !this.payout ? 1000 : parseBigInt(this.payout);
    let difficultyInt = !this.difficulty ? 3 : parseBigInt(this.difficulty);
    let canaryHex = this.canary;
    let feeOverride = !this.fee ? undefined : parseBigInt(this.fee);
    let version = parseInt(this.version)

    let m = new Mine(periodInt, payoutInt, difficultyInt, canaryHex, {
      version: version,
      network: network,
    });
    await m.execute(this.executorAddress, feeOverride);
  }
}

export class PerpetuityCommand extends CustomFeeCommand {
  static override usage = Command.Usage({
    category: `Beneficiary`,
    description: `Pay a fixed fraction of total value at intervals.`,
  });

  static override paths = [[`perpetuity`], [`p`]];

  getAddress = Option.Boolean("--deposit", false, {
    description: "give the deposit address for the contract and exit",
  });

  address = Option.String("--address", {
    required: true,
    description:
      "receiving cash address to send coins to, i.e. beneficiary address",
  });
  period = Option.String("--period", {
    required: false,
    description:
      "how often (in blocks) the contract pays (default: 4000, about monthly)",
  });
  allowance = Option.String("--allowance", {
    required: false,
    description:
      "the executor's allowance for miner fees & administration (default: 3400 sats)",
  });
  decay = Option.String("--decay", {
    required: false,
    description:
      "the divisor for the fraction taking in each installment (default: 120, i.e. 1/120 or 0.83% each installment)",
  });
  executorAddress = Option.String("--exAddress", {
    required: false,
    description: "address for fee taken by executor for submitting transaction",
  });

  async execute() {
    let network = this.isChipnet
      ? "chipnet"
      : this.isRegtest
      ? "regtest"
      : "mainnet";
    const defaultPeriod = this.isChipnet ? 1 : 4000;
    const defaultDecay = this.isChipnet ? 8 : 120;
    let periodInt = !this.period ? defaultPeriod : parseBigInt(this.period);
    let allowanceInt = !this.allowance ? 3400 : parseBigInt(this.allowance);
    let decayInt = !this.decay ? defaultDecay : parseBigInt(this.decay);
    let feeOverride = !this.fee ? undefined : parseBigInt(this.fee);
    let version = parseInt(this.version)

    if (!this.getAddress) {
      let perpetuity = new Perpetuity(
        periodInt,
        this.address,
        allowanceInt,
        decayInt,
        { version: version, network: network }
      );
      await perpetuity.info();
      if(await perpetuity.isFunded()) perpetuity.execute(this.executorAddress, feeOverride);
    } else {
      let perpetuity = new Perpetuity(
        periodInt,
        this.address,
        allowanceInt,
        decayInt,
        { version: version, network: network }
      );
      await perpetuity.info();
    }
  }
}

export class QueryCommand extends NetworkCommand {
  static override usage = Command.Usage({
    category: `Informational`,
    description: `Query a list of contracts.`,
  });

  static override paths = [[`query`], [`q`]];

  network = this.isChipnet ? "chipnet" : this.isRegtest ? "regtest" : "mainnet";
  chaingraph = Option.String("--chaingraph", {
    required: false,
    description: "A chaingraph service to query",
  });
  prefix = Option.String("--prefix", {
    required: false,
    description: "The contract prefix in hex",
  });

  async execute() {
    let chaingraph = this.chaingraph
      ? this.chaingraph
      : "https://demo.chaingraph.cash/v1/graphql";
    let prefix = this.prefix ? this.prefix : undefined;
    let node = this.isChipnet ? "chipnet" : this.isRegtest ? "rbchn" : "mainnet";
    let hexRecords = await getRecords(chaingraph, prefix, node);
    console.log(`Found ${hexRecords.length} records`);
    hexRecords.map((s: string) => console.log(s));
    let contracts = [];
    for (let record of hexRecords) {
      let instance = opReturnToSerializedString(record, this.network);
      if (instance) contracts.push(instance.toString());
    }
    console.log(`Build ${contracts.length} contracts`);
    contracts.map((contract: string) => {
      console.log(contract);
    });
  }
}

export class RecordCommand extends CustomFeeCommand {
  static override usage = Command.Usage({
    category: `Informational`,
    description: `Broadcast a contract to the blockchain`,
  });

  static override paths = [[`record`], [`r`]];

  maxFee = Option.String("--maxFee", {
    required: false,
    description: "transaction miner fee available to publish contracts",
  });
  index = Option.String("--index", {
    required: false,
    description: "a nonce to force uniqueness with identical parameters",
  });
  contract = Option.String("--contract", {
    required: false,
    description: "a serialized contract to publish",
  });
  selfPublish = Option.Boolean("--selfPublish", {
    required: false,
    description: "Whether or not to self publish the contract if funded",
  });
  network = this.isChipnet ? "chipnet" : this.isRegtest ? "regtest" : "mainnet";

  async execute() {
    let network = this.isChipnet
      ? "chipnet"
      : this.isRegtest
      ? "regtest"
      : "mainnet";
    let maxFeeInt = !this.maxFee ? undefined : parseBigInt(this.maxFee);
    let indexInt = !this.index ? undefined : parseBigInt(this.index);
    let version = parseInt(this.version)

    if (!this.contract) {
      //console.log("no contract specified");
      let r = new Record(maxFeeInt, indexInt, { version: version, network: network });
      if (await r.isFunded()) {
        await r.info();
        if(this.selfPublish) await r.broadcast();
      } else {
        await r.info();
      }
    } else {
      let r = new Record(maxFeeInt, indexInt, { version: version, network: network });
      let i = stringToInstance(this.contract, network);
      if (!i) throw Error(`Couldn't parse string ${this.contract}`);
      console.log("broadcasting... ");
      let tx = await r.broadcast(i.toOpReturn());
      console.log(tx);
    }
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