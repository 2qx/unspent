import { CodeType } from "./constant";
import { BaseUtxPhiContract } from "../common/contract.js";
import { Faucet } from "./faucet/Faucet.js";
import { getArtifactsAsync } from "./getArtifact.js";

describe(`Test getting artifacts`, () => {
  test("Should import a class", async () => {
    const faucet = new Faucet();
    const serializedFaucet = faucet.toString();
    const params = BaseUtxPhiContract.parseSerializedString(serializedFaucet);
    const artifact = await getArtifactsAsync(
      params.code as CodeType,
      params.options.version
    );

    expect(artifact.contractName.toString()).toBe("Faucet");
  });
});
