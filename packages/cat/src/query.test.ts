import {
  getPriceHistory,
  //getBlockHistory, 
  getOutputs
} from "./query.js"
/**
 * @jest-environment jsdom
 */
// test("Store and retrieve a price history", async () => {
//   let history = await getPriceHistory();

//   expect(history.length).toBeGreaterThan(1);
// });
// test("Store and retrieve a transactions", async () => {
//   let blocks = await getBlockHistory();

//   expect(blocks.length).toBeGreaterThan(990);
// });

test("Store and retrieve a transactions", async () => {
  let outputs = await getOutputs("aa20a3dac450b6fdb7fe60c8b93f9bc4291c9c88ff1e49b459fe3734f704b6e3a32c87");

  expect(outputs.length).toBeGreaterThan(2);
});