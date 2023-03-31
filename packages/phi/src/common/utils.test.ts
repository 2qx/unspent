import { toHex, binToNumber } from "./util";
import { binToHex, hexToBin } from "@bitauth/libauth";
describe(`Test utility functions`, () => {
  test("Test hex to decimal functions.", async () => {
    const oneBch = 100000000;
    expect(toHex(oneBch)).toBe("0x00E1F505");
    //expect(binToNumber(hexToBin(toHex(oneBch)))).toBe(oneBch)
    //let oneBchAlso = parseInt(binToHex(hexToBin(toHex(oneBch))),16)
    //expect(oneBch).toEqual(oneBchAlso)
  });

  // test("Test hex to decimal functions with other integers.", async () => {
  //     const values = [0,
  //         1,10,16,256,512, 521,
  //         100000000,
  //         21*100000000,
  //         2100*100000000,
  //         9000000*100000000,
  //      ]

  //     for(let v of values){
  //         expect(binToNumber(hexToBin(toHex(v)))).toBe(v)
  //     }
  // });
});
