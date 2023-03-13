import type { Input, Output, Transaction } from '@bitauth/libauth';

export interface BytecodePatternQueryI {
  prefix: string;
  node?: string;
  limit?: number;
  offset?: number;
  exclude_pattern?: string;
  after?: number;
}

export interface ContractI {
  id: string,
  data: ContractDetailsI,
  height?: number
}

export interface ContractDetailsI{
  lockingBytecode: Uint8Array;
  address: string;
  code: string;
  options: ContractOptionsI;
}

export interface ContractOptionsI{
  version: number;
  network: string;
}


export interface PsiUtxoI {
  id: string,
  data: OutpointDetailsI
}

export interface OutpointDetailsI{
  lockingBytecode?: Uint8Array;
  height: number;
  tx_hash: string;
  tx_pos: number;
  value: number;
}

export interface Utxo {
  txid: string;
  height?: number;
  vout: number;
  satoshis: number;
}

export interface BlockI{
  id: number; // height
  // tk 2038, or something.
  timestamp: Date; // new Date()
}

export interface TransactionI{
  hex: string;
}

export interface ChaingraphSearchOutputPrefixResponse{
  search_output_prefix: ChaingraphSearchOutputResult[]
}

export interface ChaingraphSearchOutputResult{
  locking_bytecode_pattern: string;
  locking_bytecode: string;
  transaction: ChaingraphBlockInclusionI;
}

export interface ChaingraphBlockInclusionI{
  block_inclusions: ChaingraphBlocksI[]
}

export interface ChaingraphBlocksI{
    "block": ChaingraphBlockI
}


export interface ChaingraphOutput extends Output<string, string> {
  fungibleTokenAmount?: bigint;
  tokenCategory?: string;
  nonfungibleTokenCapability?: 'minting' | 'mutable' | 'none';
  nonfungibleTokenCommitment?: string;
}


export interface ChaingraphTransaction
  extends Transaction<Input<string, string>, ChaingraphOutput> {
  hash: string;
  isCoinbase: boolean;
  sizeBytes: number;
}

export interface OpReturnRecords {
  record: string;
  height?: number|undefined
}

export interface ChaingraphBlockI {
  bits?: number;
  /**
   * hex-encoded
   */
  hash?: string;
  height: number|string;
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