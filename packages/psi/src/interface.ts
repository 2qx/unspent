export interface ContractI {
  id: string,
  data: ContractDetailsI,
  height?: number
}

export interface ContractDetailsI {
  
  lockingBytecode: string;
  address: string;
  code: string;
  options: ContractOptionsI;
}

export interface ContractOptionsI {
  version: number;
  network: string;
}


export interface PsiOutpointI{
    
    id: string // tx_hash:output_index
    lockingBytecode: string // Matching by Typed array is a non-starter
    value: bigint;
    state: string;

    debounce:  number;

    // transaction data
    height?: number;
    locktime: number;
    version: number;
    
}

export interface PsiSpendingInputI {
  id: string; //tx_hash; input index
  sequenceNumber: number;
  unlockingBytecode: Uint8Array;
}


export interface OutpointDetailsI {
  lockingBytecode?: string;
  height: number;
  tx_hash: string;
  tx_pos: number;
  value: number;
}

export interface Utxo {
  txid: string;
  height?: number;
  vout: number;
  satoshis: bigint;
}

export interface BlockI {
  id: number; // height
  timestamp: Date; // new Date()
}

