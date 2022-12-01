import { binToHex, hexToBin } from "@bitauth/libauth";
import { getRecords } from "./provider.js";
import { opReturnToInstance } from "../common/map.js";
import { PROTOCOL_ID } from "../common/constant.js";

describe(`Record Class Tests`, () => {
  const host = "https://demo.chaingraph.cash/v1/graphql";

  test("Should get unspent record", async () => {
    let opReturnHex =
      "6a04" +
      PROTOCOL_ID +
      "01520101025203010017a91496e199d7ea23fb779f5764b97196824002ef811a87";
    let contractStrings = await getRecords(
      host,
      "6a04" + PROTOCOL_ID + "01520101025203010017a91496e199"
    );
    if (contractStrings.length > 0) {
      expect(contractStrings[0]).toMatch(opReturnHex);
      expect(contractStrings.length).toBe(1);
      let r = opReturnToInstance(contractStrings[0])!;
      let recoveredOpReturnHex = r.toOpReturn(true);
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
