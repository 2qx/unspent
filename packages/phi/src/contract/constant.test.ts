import { contractMap } from "./constant.js";

describe(`Test class map`, () => {
  test("Should import a class", async () => {
    let fClass = contractMap["F"];
    let f = new fClass();
    expect(f.toString()).toContain("F,1,1,1000,1,a914");
  });
});
