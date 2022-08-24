
export interface UtxPhiIface {

    toString(): string

    // fromString(str:string, network:string): any

    // fromOpReturn(chunks:Uint8Array[], network:string): any 

    toChunks(): string[]

    execute(exAddress: string, fee:number): Promise<string>

    getAddress() : string

    getBalance(): Promise<number>


}

export interface ContractOptions {
    version?: number,
    network?: string
}