import { getUnspent } from "./provider";

describe(`Record Class Tests`, () => {

    const host = 'https://demo.chaingraph.cash/v1/graphql'

    test("Should get unspent record", async () => {

        let contractStrings = await getUnspent(host, "6a0462616e6b01520101025203010017a91496e199");
        expect(contractStrings[0]).toMatch("6a0462616e6b01520101025203010017a91496e199d7ea23fb779f5764b97196824002ef811a87")
        expect(contractStrings.length).toBe(1)
        
    });


    test("Should pass thru error", async () => {
 
        
        try{
            // this is an odd length hex string, which errors
            await getUnspent(host, "6a0462616e6b0");
        }catch(e){
            expect(e).toEqual(Error("invalid hexadecimal data: odd number of digits"))
        }
        
    });
});