import { Annuity } from "./annuity/index.js"
import { Divide } from "./divide/index.js"
import { Faucet } from "./faucet/index.js"
import { Mine } from "./mine/index.js"
import { Perpetuity } from "./perpetuity/index.js"
import { Record } from "./record/index.js"


export const contractMap = {
    A : Annuity,
    D : Divide,
    F : Faucet,
    M : Mine,
    P : Perpetuity,
    R : Record
}

export type CodeType = keyof typeof contractMap;

export type ContractType = typeof contractMap[keyof typeof contractMap]

export const nameMap = {
    "A": "annuity",
    "D": "divide",
    "F": "faucet",
    "M": "mine",
    "P": "perpetuity",
    "R": "record"
}