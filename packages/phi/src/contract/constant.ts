import { Annuity } from "./annuity/index.js";
//import { Buffer } from "./buffer/index.js";
import { Divide } from "./divide/index.js";
import { Faucet } from "./faucet/index.js";
import { Mine } from "./mine/index.js";
import { Perpetuity } from "./perpetuity/index.js";
import { Record } from "./record/index.js";
//import { Timelock } from "./timelock/index.js";

export const contractMap = {
  A: Annuity,
  //B: Buffer,
  D: Divide,
  F: Faucet,
  M: Mine,
  P: Perpetuity,
  R: Record,
  //T: Timelock
};

export type CodeType = keyof typeof contractMap;

export type ContractType = typeof contractMap[keyof typeof contractMap];

export const nameMap = {
  A: "annuity",
  B: "buffer",
  D: "divide",
  F: "faucet",
  M: "mine",
  P: "perpetuity",
  R: "record",
  T: "timelock",
};
