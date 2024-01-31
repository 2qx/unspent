import { decodeTransaction, hexToBin } from "@bitauth/libauth";
import { default as SqlProvider } from "./db.js";
import { getPriceHistory, getBlockHistory } from "./query.js";

// /**
//  * @jest-environment jsdom
//  */
// test("Store and retrieve a transactions", async () => {
//   let db = new SqlProvider('regtest2');
//   await db.init();
//   const txHex = "0100000001e7a70364d8cf892af0b4f6eaaa262608d27d0b4dcd0bc650566be5aae1aeba17000000006441bdd97cdbb77760aca5aef38b8b83b31ec505eae2d760da7730e9c1c0ce11282b781be06a280b43b2d37ce5f51b34995b7197a983576e6601f562215fc3f1ebea412103d32d3a03f0d188aa19dd91988b1d17f38d32f653a94ecb6d95277d7f1b47b399feffffff020000000000000000296a04010101010c686173686d6f626d656469611501f5a08be936d450c7832c1d0aa5b5f251365c3504fd020000000000001976a914361119f0da2a895453e77a8b9d30738d7e51f90f88acf9460c00"
//   let tx  = decodeTransaction(hexToBin(txHex))
//   if(typeof tx ==="string") throw(tx)
//   await db.putTransactions([txHex]);
  
//   let c = await db.getCount();
//   expect(c).toBeGreaterThan(0)
// });


test("Store and retrieve a dummy block header", async () => {
  let db = new SqlProvider('regtest3');
  await db.init();
  let d = new Date();
  let headers = [{
    height: 0,
    timestamp: d
  },
  {
    height: 1,
    timestamp: d
  }]
  
  await db.putBlockHeights(headers);
  let c = await db.getCount();
  c
 
});

test("Store the price history", async () => {
  let db = new SqlProvider('regtest5');
  await db.init();
  let prices = await getPriceHistory();
  await db.putFiatHistory(prices);
  
  let c = await db.getFiatCount();
  expect(c).toBeGreaterThan(500)
 
});


// This stores the whole block history from protocol "inception"
//
// test("Store the block history", async () => {
//   let db = new SqlProvider('regtest6');
//   await db.init();
//   let blocks = await getBlockHistory();
//   await db.putBlockHeights(blocks);
//   let c = await db.getBlockCount();
//   expect(c).toBeGreaterThan(500)
// });