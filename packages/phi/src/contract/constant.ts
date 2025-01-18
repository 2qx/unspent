import { Annuity } from "./annuity/index.js";
import { Divide } from "./divide/index.js";
import { Drip } from "./drip/index.js";
import { Faucet } from "./faucet/index.js";
import { Mine } from "./mine/index.js";
import { Perpetuity } from "./perpetuity/index.js";
import { Record } from "./record/index.js";
//import { Locktime } from "./locktime/index.js";

export const contractMap = {
  A: Annuity,
  D: Divide,
  F: Faucet,
  "$":Drip,
  M: Mine,
  P: Perpetuity,
  R: Record,
};

export type CodeType = keyof typeof contractMap;

export type ContractType = typeof contractMap[keyof typeof contractMap];

export const nameMap = {
  A: "annuity",
  D: "divide",
  "$": "drip",
  F: "faucet",
  L: "locktime",
  M: "mine",
  P: "perpetuity",
  R: "record",
};
