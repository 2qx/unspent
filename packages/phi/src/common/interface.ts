import type { Utxo } from "cashscript";

export interface UtxPhiIface {
  toString(): string;

  asText(): string;

  toOpReturn(hex: boolean): Uint8Array | string;

  execute(exAddress: string, fee: number, utxos?: Utxo[]): Promise<string>;

  getAddress(): string;

  getBalance(): Promise<number>;

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