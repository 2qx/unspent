import type { Utxo } from "cashscript"

export interface UtxPhiIface {

    toString(): string

    asText(): string
    
    toOpReturn(hex:boolean): Uint8Array | string

    execute(exAddress: string, fee:number, utxos?: Utxo[]): Promise<string>

    getAddress() : string

    getBalance(): Promise<number>

}

export interface ContractOptions {
    version?: number,
    network?: string
}