import { Psi } from "./Psi.js";
import { binToHex, hexToBin, instantiateSha256 } from "@bitauth/libauth";
import { ContractI } from "./interface.js";
import { deserialize } from "./util.js";
// @ts-ignore
import { default as recordV } from "../vectors/records.json";
// @ts-ignore
import { default as a9145fa33e863cfdbca34f8a5f4c4bb50c46feb7f17487 } from "../vectors/a9145fa33e863cfdbca34f8a5f4c4bb50c46feb7f17487.json";

import { sleep } from "./util.js";

//import { getChaingraphUnspentRecords } from "./query/index.js";
import { getHistory, HistoryQueryI } from "./query/index.js";

beforeAll(async () => {
  const host = "https://demo.chaingraph.cash/v1/graphql";
  // const records = await getChaingraphUnspentRecords(
  //   host,
  //   "6a047574786f",
  //   undefined,
  //   200
  // );
  // const blob = JSON.stringify(records, serialize)
  // fs.writeFile("./packages/psi/vectors/records.json","export const vectorStr = \""+ blob+ "\"", function (err: any) {
  //   if (err) {
  //     return console.log(err);
  //   }
  //   console.log("The file was saved!");
  // });


  // const history = await getHistory(
  //   host,
  //   "a9145fa33e863cfdbca34f8a5f4c4bb50c46feb7f17487",
  //   {
  //     limit: 500,
  //     offset: 0,
  //     after: 0
  //   } as HistoryQueryI
  // );
  // const blob = JSON.stringify(history, serialize)
  // fs.writeFile("./packages/psi/vectors/history.json", blob, function (err: any) {
  //   if (err) {
  //     return console.log(err);
  //   }
  //   console.log("The file was saved!");
  // });
});


test("Should store a contract", async () => {
  const contracts = new Psi("mainnet");
  const f1Record = "6a047574786f01460101010102b004010317a9142d3513cd6722f98dd8e1f99cd4f6913072c96ced87"
  await contracts.putUnspentPhiContractFromSerial(f1Record)
  const results = await contracts.getUnspentPhiContracts({ prefix: "6a047574786f0146010" })
  expect(results[0].id).toBe(f1Record)
  expect(results[0].data.options.network).toBe("mainnet")
  expect(results[0].data.code).toBe("F")
  expect(results[0].data.address).toBe("bitcoincash:pqkn2y7dvu30nrwcu8uee48kjyc89jtva54p2ckt5p")
});

test("Should store a contract, again", async () => {
  const contracts = new Psi("mainnet");
  const f1Record = "6a047574786f01460101010102b004010317a9142d3513cd6722f98dd8e1f99cd4f6913072c96ced87"
  await contracts.putUnspentPhiContractFromSerial(f1Record)
  const results = await contracts.getUnspentPhiContracts({ prefix: "6a047574786f0146010" })
  expect(results[0].id).toBe(f1Record)
  expect(results[0].data.options.network).toBe("mainnet")
  expect(results[0].data.code).toBe("F")
  expect(results[0].data.address).toBe("bitcoincash:pqkn2y7dvu30nrwcu8uee48kjyc89jtva54p2ckt5p")

});


test("Should get only record contracts", async () => {
  const records = JSON.parse(JSON.stringify(recordV), deserialize)
  const contracts = new Psi("mainnet");
  await contracts.bulkPutUnspentPhiContracts(records as ContractI[])
  
  const results = await contracts.getUnspentPhiContracts({ code: "R" })
  expect(results.length).toBe(6)
  expect(results[0].data.options.network).toBe("mainnet")
  results.map(r=>{expect(r.data.code).toBe("R")})
  
});

test("Should get a v0 perp contract", async () => {
  const records = JSON.parse(JSON.stringify(recordV), deserialize)
  const contracts = new Psi("mainnet");
  await contracts.bulkPutUnspentPhiContracts(records as ContractI[])
  
  const results = await contracts.getUnspentPhiContracts({ code: "P", version:0, limit:1 })
  expect(results.length).toBe(1)
  expect(results[0].data.options.network).toBe("mainnet")
  expect(results[0].data.code).toBe("P")
  expect(results[0].data.options.version).toBe(0)
});

test("Should store put a lot of contracts", async () => {
  const records = JSON.parse(JSON.stringify(recordV), deserialize)
  const contracts = new Psi("mainnet");
  const f1Record = "6a047574786f01460101010102b004010317a9142d3513cd6722f98dd8e1f99cd4f6913072c96ced87"
  await contracts.bulkPutUnspentPhiContracts(records as ContractI[])
  const results = await contracts.getUnspentPhiContracts({ prefix: "6a047574786f01460101010102b0040103" })
  expect(results[0].id).toBe(f1Record)
  expect(results[0].data.options.network).toBe("mainnet")
  expect(results[0].data.code).toBe("F")
  const results2 = await contracts.getUnspentPhiContracts({ prefix: "6a047574786f", limit: 5000 })
  expect(results2.length).toBeGreaterThan(100)

});

test("Should put contracts twice without errors", async () => {
  const records = JSON.parse(JSON.stringify(recordV), deserialize)
  const contracts = new Psi("mainnet2");

  await contracts.bulkPutUnspentPhiContracts(records as ContractI[])
  const results = await contracts.getUnspentPhiContracts({})
  expect(results[0].id).toContain("6a047574786f01410101")
  expect(results[0].data.options.network).toBe("mainnet")
  expect(results[0].data.code).toBe("A")
  const results2 = await contracts.getUnspentPhiContracts({ prefix: "6a047574786f", limit: 5000 })
  expect(results2.length).toBeGreaterThan(100)

});

test.skip("Should store a block height", async () => {

  const db = new Psi("mainnet");

  await db.setBlockHeight(1)
  await db.setBlockHeight(2)
  await db.setBlockHeight(3)
  await db.setBlockHeight(4)
  await sleep(4000)

  const result = await db.getBlockHeight()
  expect(result?.id).toBe(4)


});

test.skip("Should store a lot of block heights", async () => {

  const db = new Psi("mainnet");
  let setPromises = [...Array(5001).keys()].map(i => {return db.setBlockHeight(i)})
  await Promise.allSettled(setPromises)
  

  const result = await db.getBlockHeight()
  
  expect(result.id).toBe(5000)

});

test("Should store a lot of transactions", async () => {
  const db = new Psi("mainnet");
  const history = JSON.parse(JSON.stringify(a9145fa33e863cfdbca34f8a5f4c4bb50c46feb7f17487), deserialize)
  const lockHex = "a9145fa33e863cfdbca34f8a5f4c4bb50c46feb7f17487"
  await db.bulkPutRawTransaction(history, lockHex)
  
  const result = await db.getUtxosByLockingBytecode(lockHex)
  expect(result.length).toBe(1)
  expect(result![0].id).toBe("46c5fb5f43a230fa457e67f1f33f2054336f79824ad833ea47a874bdaddcaedf:1")
  expect(result![0].lockingBytecode).toBe(lockHex)
  expect(result![0].state).toBe("UTXO")
  expect(result![0].value).toBeGreaterThan(196009130)
  expect(result![0].locktime).toBe(782180)
});
