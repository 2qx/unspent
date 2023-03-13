import { Psi } from "./Psi.js";
import { vector } from "../vectors/search_output_prefix.js"
import { hexToBin } from "@bitauth/libauth";
import { ChaingraphSearchOutputPrefixResponse } from "./interface.js";


test("Should store a contract", async () => {
  let contracts = new Psi("mainnet");
  const f1Record = "6a047574786f01460101010102b004010317a9142d3513cd6722f98dd8e1f99cd4f6913072c96ced87"
  await contracts.addUnspentPhiContract(f1Record)
  let results = await contracts.getUnspentPhi({ prefix: "6a047574786f0146010" })
  expect(results[0].id).toBe(f1Record)
  expect(results[0].data.options.network).toBe("mainnet")
  expect(results[0].data.code).toBe("F")
  expect(results[0].data.address).toBe("bitcoincash:pqkn2y7dvu30nrwcu8uee48kjyc89jtva54p2ckt5p")

});


test("Should store put a lot of contracts", async () => {
  let contracts = new Psi("mainnet");
  const f1Record = "6a047574786f01460101010102b004010317a9142d3513cd6722f98dd8e1f99cd4f6913072c96ced87"
  await contracts.bulkPutSearchOutputPrefix(vector.data as ChaingraphSearchOutputPrefixResponse)
  let results = await contracts.getUnspentPhi({ prefix: "6a047574786f01460101010102b0040103" })
  expect(results[0].id).toBe(f1Record)
  expect(results[0].data.options.network).toBe("mainnet")
  expect(results[0].data.code).toBe("F")
  let results2 = await contracts.getUnspentPhi({ prefix: "6a047574786f", limit: 5000 })
  expect(results2.length).toBeGreaterThan(100)

});

test("Should put contracts twice without errors", async () => {
  let contracts = new Psi("mainnet");
  const f1Record = "6a047574786f01460101010102b004010317a9142d3513cd6722f98dd8e1f99cd4f6913072c96ced87"
  await contracts.bulkPutSearchOutputPrefix(vector.data)
  let results = await contracts.getUnspentPhi({ prefix: "6a047574786f01460101010102b0040103" })
  expect(results[0].id).toBe(f1Record)
  expect(results[0].data.options.network).toBe("mainnet")
  expect(results[0].data.code).toBe("F")
  let results2 = await contracts.getUnspentPhi({ prefix: "6a047574786f", limit: 5000 })
  expect(results2.length).toBeGreaterThan(100)

});


test("Should store an unspent output", async () => {

  let outpoints = new Psi("mainnet");
  let lockingBtyecode = hexToBin("a9142d3513cd6722f98dd8e1f99cd4f6913072c96ced87")
  //"f2b80c100b5e5e2f4007e00fc480a57490cca5f309346614e6732877c7b780eb"

  let outpoint = {
    "height": 782464,
    "tx_hash": "896708e2a85d1ba8169d0c5e852eedbaa3daf27092c76b1df9a2145b97b9b73c",
    "tx_pos": 0,
    "value": 546
  }

  await outpoints.addUtxo(outpoint, lockingBtyecode)
  let results = await outpoints.getUtxosByLockingBytecode(lockingBtyecode)
  expect(results[0].id).toBe("896708e2a85d1ba8169d0c5e852eedbaa3daf27092c76b1df9a2145b97b9b73c:0")
  expect(results[0].data.height).toBe(782464)
  expect(results[0].data.value).toBe(546)
  expect(results[0].data.tx_hash).toBe("896708e2a85d1ba8169d0c5e852eedbaa3daf27092c76b1df9a2145b97b9b73c")
  expect(results[0].data.tx_pos).toBe(0)

});

test("Should store a block height", async () => {

  let db = new Psi("mainnet");

  await db.setBlockHeight(1)
  await db.setBlockHeight(2)
  await db.setBlockHeight(3)
  await db.setBlockHeight(4)

  let result = await db.getBlockHeight()
  expect(result?.id).toBe(4)


});


test("Should store a lot of block heights", async () => {

  let db = new Psi("mainnet");
  [...Array(5001).keys()].map(i => db.setBlockHeight(i))
  let result = await db.getBlockHeight()
  expect(result.id).toBe(5000)

});