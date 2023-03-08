export interface BytecodePatternQueryI {
  prefix: string;
  node?: string;
  limit?: number;
  offset?: number;
}

export interface ContractI {
  id: string,
  data: ContractDetailsI
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