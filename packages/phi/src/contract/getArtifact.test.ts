import { CodeType } from './constant';
import { BaseUtxPhiContract } from "../common/contract.js"
import { Faucet } from "./faucet/Faucet.js"
import { getArtifactsAsync } from "./getArtifact.js" 

describe(`Test getting artifacts`, () => {

    test("Should import a class", async () => {

        let faucet = new Faucet()
        let serializedFaucet = faucet.toString()
        let params = BaseUtxPhiContract.parseSerializedString(serializedFaucet)
        let artifact = await getArtifactsAsync(params.code as CodeType, params.options.version)
         
        expect(artifact.contractName.toString()).toBe("Faucet")
    });
});