import { HistoryQueryI, BytecodePatternQueryDefaults, HistoryIDefaults } from "./interface.js"
import { getHistory, getRecords } from "./provider.js";
import { opReturnToInstance } from "../common/map.js";
import { PROTOCOL_ID } from "../common/constant.js";

describe(`Record Class Tests`, () => {
  const host = "https://demo.chaingraph.cash/v1/graphql";

  test("Should get unspent record", async () => {
    const opReturnHex =
      "6a04" +
      PROTOCOL_ID +
      "01520101025203010017a91496e199d7ea23fb779f5764b97196824002ef811a87";
    const contractStrings = await getRecords(
      host,
      "6a04" + PROTOCOL_ID + "01520101025203010017a91496e199"
    );
    if (contractStrings.length > 0) {
      expect(contractStrings[0]).toMatch(opReturnHex);
      expect(contractStrings.length).toBe(1);
      const r = opReturnToInstance(contractStrings[0])!;
      const recoveredOpReturnHex = r.toOpReturn(true);
      expect(recoveredOpReturnHex).toBe(opReturnHex);
    }
  });

  test("Should pass thru error", async () => {
    try {
      // this is an odd length hex string, which errors
      await getRecords(host, PROTOCOL_ID + "0");
    } catch (e) {
      expect(e).toEqual(
        Error("invalid hexadecimal data: odd number of digits")
      );
    }
  });
});

describe(`Provider Tests`, () => {
  const host = "https://demo.chaingraph.cash/v1/graphql";

  test("Should get a history", async () => {
    // this is an odd length hex string, which errors
    const param = {
      limit: 1,
      offset: 0,
      after: 0
    } as HistoryQueryI
    
    const result = (await getHistory(host, "a9143dbc74da4ca839c7bc5ae5e05e1b73c41aa1273187", param))[0];
    expect(result.raw).toContain("010000000")
    expect(result.height).toBeGreaterThan(709010)

  });
});


describe(`Tests default parameters`, () => {


  test("Should get use default", async () => {
    // this is an odd length hex string, which errors
    const param = {} as HistoryQueryI
    const query = {  ...BytecodePatternQueryDefaults, ...param }
    expect(query.after).toBe(0)
    expect(query.exclude_pattern).toBe("6a0401010102010717")
    expect(query.offset).toBe(0)
    expect(query.limit).toBe(50)
    expect(query.prefix).toBe("6a04" + PROTOCOL_ID)
    expect(query.node).toBe("mainnet")

  });

  test("Should get override default", async () => {
    // this is an odd length hex string, which errors
    const param = {
      after: 1,
      exclude_pattern: "test",
      offset: 2,
      limit: 3,
      prefix: "6a0400000000",
      node:"testnet"
    } as HistoryQueryI
    const query = {  ...BytecodePatternQueryDefaults, ...param }
    expect(query.after).toBe(1)
    expect(query.exclude_pattern).toBe("test")
    expect(query.offset).toBe(2)
    expect(query.limit).toBe(3)
    expect(query.prefix).toBe("6a04" + "00000000")
    expect(query.node).toBe("testnet")

  });


});