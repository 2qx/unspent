import { contractMap } from "./constant.js";

describe(`Test class map`, () => {
  test("Should import a class", async () => {
    const fClass = contractMap["F"];
    const f = new fClass();
    expect(f.toString()).toContain("F,1,1,1000,1,a914");
  });
});
