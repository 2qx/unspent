import type { Utxo } from "cashscript";

export interface UtxPhiIface {
  toString(): string;

  asText(): string;

  toOpReturn(hex: boolean): Uint8Array | string;

  execute(exAddress: string, fee: bigint, utxos?: Utxo[], debug?: boolean): Promise<string>;

  getAddress(): string;

  getBalance(): Promise<bigint>;

  getOutputLockingBytecodes(hex: boolean): string[] | Uint8Array[];
}

export interface ContractOptions {
  version?: number;
  network?: string;
}

export interface ParsedContractI {
  code: string;
  options: {
    version: number;
    network: string;
  };
  args: Uint8Array[];
  lockingBytecode: Uint8Array;
  address: string;
}

// Weird setup to allow both Enum parameters, as well as literal strings
// https://stackoverflow.com/questions/51433319/typescript-constructor-accept-string-for-enum
const literal = <L extends string>(l: L): L => l;
export const Network = {
  MAINNET: literal("mainnet"),
  TESTNET: literal("testnet"),
  REGTEST: literal("regtest"),
};
export type Network = typeof Network[keyof typeof Network];