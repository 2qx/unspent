import { opReturn } from '@bitauth/libauth';
import { Annuity } from "./Annuity.js"
import { 
    createOpReturnData, 
    derivePublicKeyHashHex, 
    decodeNullDataScript  
} from "../../common/util.js"

describe(`Annuity Class Tests`, () => {

    test("Should serialize a Annuity", async () => {
        let a = new Annuity(4000, "bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr",5000,500)
        let chk = derivePublicKeyHashHex("bitcoincash:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwuwprm4szr")
        expect(a.toString()).toContain(chk)
        expect(a.toString()).toEqual("A,1,4000,a9143d416d6b3b4f59826661d868ba4fd6f62fde537787,5000,500,a914b12dbd2e135db366bfd15620aad82e9ded28bdca87")
        let a2 = Annuity.fromString(a.toString())
        expect(a.toString()).toEqual(a2.toString())
        expect(a.getAddress()).toEqual(a2.getAddress())
        expect(a.isTestnet()).toEqual(a2.isTestnet())
    });

    test("Should deserialize and reserialize a staging Annuity", async () => {
        let a = new Annuity(5,process.env['ADDRESS']!,5000, 500, {version:1, network:"regtest"})
        let a2 = Annuity.fromString(a.toString(), "regtest")
        expect(a.toString()).toEqual(a2.toString())
        expect(a.getAddress()).toEqual(a2.getAddress())
        expect(a.isTestnet()).toEqual(a2.isTestnet())
    });

    test("Should error on next version ", async () => {
        try{
            new Annuity(5,process.env['ADDRESS']!,5000, 500, {version:22, network:"regtest"})
        }catch(e){
            expect(e).toEqual(Error("Unrecognized Annuity Version"))
        }
        
    });

    test("Should deserialize and reserialize a staging Annuity to chunks and opreturn", async () => {
        
        let options = {version:1,network:"regtest"}
        let a1 = new Annuity(5,process.env['ADDRESS']!,5000, 500, options)
        let opReturn = a1.toOpReturn(false)
        let a2 = Annuity.fromOpReturn(opReturn, "regtest")
        expect(a1.toString()).toEqual(a2.toString())
        expect(a2.isTestnet()).toEqual(true)
        expect(a1.getAddress()).toEqual(a2.getAddress())

    });

    test("Should a return info", async () => {
        
        let options = {version:1,network:"regtest"}
        let c1 = new Annuity(5,process.env['ADDRESS']!,5000, 500, options)
        let info = await c1.info(false)
        expect(info).toContain(c1.toString())
        expect(info).toContain("balance")
        
    });

});