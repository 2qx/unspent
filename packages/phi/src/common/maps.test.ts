import { opReturnToInstance } from "./map.js"
import { Record } from "../contract/record" 

describe(`Test mapping serialized contracts`, () => {

    test("Should be the true true", async () => {
        let r = (new Record(850,0)).toString()
        let recordOpReturn = "6a0462616e6b01520101025203010017a91496e199d7ea23fb779f5764b97196824002ef811a87"
        let r2 = opReturnToInstance(recordOpReturn)
        expect(r.toString()).toBe(r2.toString())
        });

});