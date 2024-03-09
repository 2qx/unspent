import { getRegularSeries } from "./timeseries.js";

getRegularSeries
let irregularTs = [
  {
    date: "2022-06-13",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: 0.05829027
  },
  {
    date: "2022-07-12",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022829
  },
  {
    date: "2022-08-09",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022753
  },
  {
    date: "2022-09-12",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022677
  },
  {
    date: "2022-10-12",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022602
  },
  {
    date: "2022-11-11",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022526
  },
  {
    date: "2022-12-11",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022451
  },
  {
    date: "2023-01-11",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022376
  },
  {
    date: "2023-02-11",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022302
  },
  {
    date: "2023-03-13",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022227
  },
  {
    date: "2023-04-11",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022152
  },
  {
    date: "2023-05-10",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022078
  },
  {
    date: "2023-06-07",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00022004
  },
  {
    date: "2023-07-03",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00021931
  },
  {
    date: "2023-07-31",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00021858
  },
  {
    date: "2023-08-28",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00021786
  },
  {
    date: "2023-09-25",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00021713
  },
  {
    date: "2023-10-23",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00021641
  },
  {
    date: "2023-11-21",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00021569
  },
  {
    date: "2023-12-19",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00021497
  },
  {
    date: "2024-01-15",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00021425
  },
  {
    date: "2024-02-12",
    locking_bytecode: 'a914ded0997926d28189d2279903fca64ba68e08830d87',
    dv: -0.00021354
  }
]

test("Store and retrieve a transactions", async () => {
  let regular = getRegularSeries(irregularTs)
  console.log(regular)
  expect(regular.length).toBeGreaterThan(500)
});
