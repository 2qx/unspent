import { Mine } from "./Mine"
import { RegTestWallet } from "mainnet-js";

import { createOpReturnData, decodeNullDataScript, mine } from "../../common/util"

describe(`Mine Class Tests`, () => {

    test("Should a serialize a mine", async () => {
        let m = new Mine()
        expect(m.toString()).toEqual(`M,1,1,5000,3,00000000000000,a914513bd2e0bc053a4352652a91a05aff1ef003c7b787`)

        let m2 = Mine.fromString(m.toString())

        expect(m.toString()).toEqual(m2.toString())
        expect(m.getAddress()).toEqual(m2.getAddress())
        expect(m.isTestnet()).toEqual(m2.isTestnet())
    });

    test("Should a deserialize and reserialize a staging mine", async () => {
        let m = new Mine(5,3000,2,undefined,{version: 1,network: "staging"})

        let m2 = Mine.fromString(m.toString(), "staging")

        expect(m.toString()).toEqual(m2.toString())
        expect(m.getAddress()).toEqual(m2.getAddress())
        expect(m.isTestnet()).toEqual(m2.isTestnet())
    });

    test("Should a deserialize and reserialize a regtest Mine to chunks and from an opreturn", async () => {
        
        let options = {version:1,network:"regtest"}
        let m1 = new Mine(5,3000,2,undefined,options)
        let chunks = m1.toChunks()
        let data = createOpReturnData(chunks)
        let opReturn = decodeNullDataScript(data)
        let m2 = Mine.fromOpReturn(opReturn, "regtest")
        expect(m1.toString()).toEqual(m2.toString())
        expect(m2.isTestnet()).toEqual(true)
        expect(m1.getAddress()).toEqual(m2.getAddress())
        
    });

    test("Should 'mine' a payout to an address", async () => {
        
        let options = {version:1,network:"regtest"}
        let m1 = new Mine(5,3000,2,undefined,options)

        const alice = await RegTestWallet.fromId(process.env['ALICE_ID']!);
        const bob = await RegTestWallet.newRandom();

        await alice.send([
            {
                cashaddr: m1.getAddress(),
                value: 50000,
                unit: "satoshis",
            },
        ]);  
        await mine({cashaddr: alice.getDepositAddress(), blocks:6})
        expect(await m1.getBalance()).toBeGreaterThan(100)
        m1.getAddress()
        let response = await m1.execute(bob.getDepositAddress()) 
        expect(await bob.getBalance('sats')).toBeGreaterThan(300)
        
    });



});