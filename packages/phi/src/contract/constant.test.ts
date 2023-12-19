import { contractMap } from "./constant.js";
import type { IdentitySnapshot } from "mainnet-js";

const a: IdentitySnapshot; 


describe(`Test class map`, () => {
  test("Should import a class", async () => {
    const fClass = contractMap["F"];
    const f = new fClass(undefined,undefined,undefined,{version:1});
    expect(f.toString()).toContain("F,1,1,1000,1,a914");
  });
});
