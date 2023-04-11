import type { Input, Output, Transaction } from '@bitauth/libauth';
import { PROTOCOL_ID } from '../common/constant.js';

export interface BytecodePatternQueryI {
  prefix?: string;
  node?: string;
  limit?: number;
  offset?: number;
  exclude_pattern?: string;
  after?: number;
}

export interface BytecodePatternExtendedQueryI {
  code?:string;
  version?:number;
  prefix?: string;
  node?: string;
  limit?: number;
  offset?: number;
  exclude_pattern?: string;
  after?: number;
}

export const BytecodePatternQueryDefaults: BytecodePatternQueryI = {
  prefix: "6a04" + PROTOCOL_ID,
  node: "mainnet",
  limit: 50,
  offset: 0,
  exclude_pattern: "",
  after: 0,
}

export interface HistoryQueryI{
  node?: string;
  limit?: number;
  offset?: number;
  after: number;
}

export const HistoryIDefaults: HistoryQueryI = {
  node: "mainnet",
  limit: 500,
  offset: 0,
  after: 0,
}


export interface HistoryI {
  raw: string
  hash: string
  height?: number
  timestamp?: number
  spentBy?: string[]
}


export interface ChaingraphSearchOutputPrefixResponse {
  search_output_prefix: ChaingraphSearchOutputResult[]
}

export interface ChaingraphSearchOutputResult {
  locking_bytecode_pattern: string;
  locking_bytecode: string;
  transaction: ChaingraphBlockInclusionI;
}

export interface ChaingraphBlockInclusionI {
  block_inclusions: ChaingraphBlocksI[]
}

export interface ChaingraphBlocksI {
  "block": ChaingraphBlockI
}

export interface ChaingraphBlockI {
  bits?: number;
  /**
   * hex-encoded
   */
  hash?: string;
  height: number | string;
  /**
   * hex-encoded
   */
  merkleRoot?: string;
  nonce?: number;
  /**
   * hex-encoded
   */
  previousBlockHash?: string;
  sizeBytes?: number;
  timestamp?: number;
  version?: number;
  transactions?: ChaingraphTransaction[];
}

export interface ChaingraphTransaction
  extends Transaction<Input<string, string>, ChaingraphOutput> {
  hash: string;
  isCoinbase: boolean;
  sizeBytes: number;
}

export interface ChaingraphOutput extends Output<string, string> {
  fungibleTokenAmount?: bigint;
  tokenCategory?: string;
  nonfungibleTokenCapability?: 'minting' | 'mutable' | 'none';
  nonfungibleTokenCommitment?: string;
}