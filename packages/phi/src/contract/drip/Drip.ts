import type { Artifact, Utxo, NetworkProvider } from "cashscript";
import type { UtxPhiIface, ContractOptions } from "../../common/interface.js";
import { DefaultOptions } from "../../common/constant.js";
import { BaseUtxPhiContract } from "../../common/contract.js";
import { sum, toHex, binToBigInt } from "../../common/util.js";
import { artifact as v2 } from "./cash/v2.js";

export class Drip extends BaseUtxPhiContract implements UtxPhiIface {
    public static c: string = "$";
    private static fn: string = "drip";
    public static minPayout: bigint = 164n;

    constructor(
        public options: ContractOptions = DefaultOptions
    ) {
        let script: Artifact;
        if (options.version === 2) {
            script = v2;
        } else {
            throw Error("Unrecognized Drip Version");
        }


        super(options.network!, script, []);
        this.options = options;
    }

    refresh(): void {
        this._refresh([]);
    }

    static fromString(str: string, network = "mainnet"): Drip {
        const p = this.parseSerializedString(str, network);

        // if the contract shortcode doesn't match, error
        if (!(Drip.c == p.code))
            throw "non-faucet serialized string passed to faucet constructor";

        if (![2].includes(p.options.version))
            throw Error("faucet contract version not recognized");

        if (p.args.length != 0)
            throw `invalid number of arguments ${p.args.length}`;

        const faucet = new Drip(p.options);
        faucet.checkLockingBytecode(p.lockingBytecode);
        return faucet;
    }

    // Create a Drip contract from an OpReturn by building a serialized string.
    static fromOpReturn(
        opReturn: Uint8Array | string,
        network = "mainnet"
    ): Drip {
        const p = this.parseOpReturn(opReturn, network);

        // check code
        if (p.code !== this.c)
            throw Error(`Wrong short code passed to ${this.name} class: ${p.code}`);

        // version
        if (![0, 1, 2].includes(p.options.version))
            throw Error(
                `Wrong version code passed to ${this.name} class: ${p.options.version}`
            );

        // parse arguments
        if (p.args.length != 0)
            throw `invalid number of arguments ${p.args.length}`;


        const faucet = new Drip(p.options);
        faucet.checkLockingBytecode(p.lockingBytecode);
        return faucet;
    }

    static async getSpendableBalance(
        opReturn: Uint8Array | string,
        network = "mainnet",
        networkProvider: NetworkProvider,
        blockHeight: number
    ): Promise<bigint> {
        const p = this.parseOpReturn(opReturn, network);
        const utxos = await networkProvider.getUtxos(p.address);
        const spendableUtxos = utxos.map((u: Utxo) => {
            // @ts-ignore
            if (u.height !== 0) {
                // @ts-ignore
                if (blockHeight - u.height > period) {
                    return u.satoshis;
                } else {
                    return 0n;
                }
            } else {
                return 0n;
            }
        });
        const spendable =
            spendableUtxos.length > 0 ? spendableUtxos.reduce(sum) : 0n;
        if (spendable > Drip.minPayout) {
            return spendable;
        } else {
            return 0n;
        }
    }

    static getExecutorAllowance(
        opReturn: Uint8Array | string,
        network = "mainnet"
    ): bigint {
        const p = this.parseOpReturn(opReturn, network);
        // pop the index to get to the payout
        p.args.pop()!;
        return binToBigInt(p.args.pop()!);
    }

    override toString() {
        return [
            `${Drip.c}`,
            `${this.options!.version}`,
            `${this.getLockingBytecode()}`,
        ].join(Drip.delimiter);
    }

    override asText() {
        return `The dripping miner MEV faucet`;
    }

    override asCommand(): string {
        let chipnetFlag = this.options.network == 'mainnet' ? '' : "--chipnet ";
        return `unspent drip  ${chipnetFlag} --version ${this.options.version}`;
    }

    toOpReturn(hex = false): string | Uint8Array {
        const chunks = [
            Drip._PROTOCOL_ID,
            Drip.c,
            toHex(this.options!.version!),
            "0x" + this.getLockingBytecode(true),
        ];
        return this.asOpReturn(chunks, hex);
    }

    getOutputLockingBytecodes(hex = true) {
        hex;
        return [];
    }

    isSpecial(): boolean {
        return false;
    }

    async execute(
        //@ts-ignore
        exAddress?: string,
        //@ts-ignore
        fee?: bigint,
        utxos?: Utxo[],
        debug?: boolean
    ): Promise<string> {

        // Filter to inputs of sufficient age
        if (!utxos) utxos = await this.getUtxos(Number(1));
        debug;
        const fn = this.getFunction(Drip.fn)
        let txids = await Promise.all(utxos!.map(async (utxo) => await this.doDrip(utxo, fn)))
        
        console.log(txids)
        return txids!.join(",")
    }

    async doDrip(utxo: Utxo, fn: any) {

        let balance = BigInt(utxo!.satoshis!);

        let tx = fn();
        let newPrincipal = balance - BigInt(balance * 4392n / 1333036486n) + 1n

        const to = []
        tx = tx.from([utxo]);
        // if enough remains for an additional payout
        if ((balance - newPrincipal) > Drip.minPayout) {
            to.push({
                to: this.getAddress(),
                amount: newPrincipal,
            })
            tx.to(to)
        } else if (balance > Drip.minPayout) {
            newPrincipal = balance - Drip.minPayout
            to.push({
                to: this.getAddress(),
                amount: newPrincipal,
            })
            tx.to(to)
        }
        else {
            tx.withOpReturn([""])
        }

        tx.withAge(1)
            .withoutChange();

        let txn = ""
        txn = (await tx.send()).txid;
        return txn;
    }
}


