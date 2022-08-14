import { Mine } from "./Mine"
import { createProtocolOpReturnData, decodeNullDataScript } from "../../common/util"

describe(`Mine Class Tests`, () => {

    test("Should a serialize a mine", async () => {
        let m = new Mine()
        expect(m.toString()).toEqual(`M,1,1,5000,3,00000000000000,a914fd8c7e39da88dbe6a32b9d9341e9385b8e62b88887`)

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
        let data = createProtocolOpReturnData(chunks)
        let opReturn = decodeNullDataScript(data)
        let m2 = Mine.fromOpReturn(opReturn, "regtest")
        expect(m1.toString()).toEqual(m2.toString())
        expect(m2.isTestnet()).toEqual(true)
        expect(m1.getAddress()).toEqual(m2.getAddress())
        
    });


});