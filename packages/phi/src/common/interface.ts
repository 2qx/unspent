
export interface UtxfiContract {

    toString(): string

    execute(exAddress: string, fee:number): Promise<string>

    getAddress() : string

    getBalance(): Promise<number>


}

export interface ContractOptions {
    version?: number,
    network?: string
}