import { Perpetuity } from "./Perpetuity.js"
import { derivePublicKeyHashHex, createOpReturnData, decodeNullDataScript } from "../../common/util.js"

describe(`Perpetuity Class Tests`, () => {

    test("Should a serialize a Perpetuity", async () => {
        let p = new Perpetuity(4000, "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",1000,12)
        let chk = derivePublicKeyHashHex("bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr")
        expect(p.toString()).toContain(chk)
        expect(p.toString()).toEqual("P,1,4000,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787,1000,12,a91401f2644ebbda119fb742c1d34be1b38cb7cae88a87")

        let p2 = Perpetuity.fromString(p.toString())

        expect(p.toString()).toEqual(p2.toString())
        expect(p.getAddress()).toEqual(p2.getAddress())
        expect(p.isTestnet()).toEqual(p2.isTestnet())
    });

    test("Should a deserialize and reserialize a staging Perpetuity", async () => {
        let options = {version:1,network:"staging"}
        let p = new Perpetuity(5,"bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",2000, 120, options)

        let p2 = Perpetuity.fromString(p.toString(), "staging")

        expect(p.toString()).toEqual(p2.toString())
        expect(p.getAddress()).toEqual(p2.getAddress())
        expect(p.isTestnet()).toEqual(p2.isTestnet())
    });

    test("Should a deserialize and reserialize a regtest Perpetuity to and from an opreturn", async () => {
        
        let options = {version:1,network:"regtest"}
        let p1 = new Perpetuity(5,"bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",2000, 120, options)
        let opReturn = p1.toOpReturn()
        let p2 = Perpetuity.fromOpReturn(opReturn, "regtest")
        expect(p1.toString()).toEqual(p2.toString())
        expect(p2.isTestnet()).toEqual(true)
        expect(p1.getAddress()).toEqual(p2.getAddress())

    });

});