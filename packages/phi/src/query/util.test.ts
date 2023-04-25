import { prepareBytecodeQueryParameters } from "./util.js"

describe(`Record Class Tests`, () => {


  test("Should set prefix for v1 annuity", async () => {
    const extended = {
      version: 1,
      code: "a"
    }
    const result = prepareBytecodeQueryParameters(extended)

    expect(result.prefix).toBe("6a047574786f01410101");
    expect(result.limit).toBe(50);
    expect(result.after).toBe(0);
    expect(result.offset).toBe(0);
    expect(result.node).toBe("mainnet");
    expect(result.exclude_pattern).toBe("");

  });


  test("Should set prefix for v1 annuity", async () => {
    const extended = {
      version: 0,
      code: "a"
    }
    const result = prepareBytecodeQueryParameters(extended)

    expect(result.prefix).toBe("6a047574786f01410100");
    expect(result.limit).toBe(50);
    expect(result.after).toBe(0);
    expect(result.offset).toBe(0);
    expect(result.node).toBe("mainnet");
    expect(result.exclude_pattern).toBe("");

  });

  test("Should set prefix for un-versioned annuity", async () => {
    const extended = {
      code: "a"
    }
    const result = prepareBytecodeQueryParameters(extended)
    expect(result.prefix).toBe("6a047574786f0141");
  });

  test("Should not set prefix for v0 of unspecified type", async () => {
    const extended = {
      version: 0
    }
    const result = prepareBytecodeQueryParameters(extended)
    expect(result.prefix).toBe("6a047574786f");
  });

});