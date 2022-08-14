import { getV1 } from "./v1"

describe(`Example Divide Tests`, () => {

    test("Should generate a contract with one output", async () => {

        let generated = getV1(1)
    
        let expected = `pragma cashscript >= 0.7.0;
  // This is an experimental divider contract 
  // Splits input across a range of predetermined outputs
  // Alpha stage, tested on regtest and testnet
  contract Divide(
      // allowance for party executing the contract
      int executorAllowance,
      // number of outputs receiving payout
      int divisor,

      // for each beneficiary, take the LockingBytecode as input
      bytes r0LockingBytecode
  ) {
      function execute() {

        // distributes to each output in order
        require(tx.outputs[0].lockingBytecode == r0LockingBytecode);

        // Get the total value of inputs
        int currentValue = tx.inputs[this.activeInputIndex].value;

        // Total value paid to beneficiaries, minus executor allowance
        int distributedValue = currentValue - executorAllowance;

        // Value paid to each beneficiary
        int distribution = distributedValue / divisor;

        // each output must be greater or equal to the distribution amount
        require(tx.outputs[0].value >= distribution);
      }
  }`
    
            expect(expected).toBe(generated)
    
      });
  
  test("Should generate a contract with two outputs", async () => {

    let generated = getV1(2)

    let expected = `pragma cashscript >= 0.7.0;
  // This is an experimental divider contract 
  // Splits input across a range of predetermined outputs
  // Alpha stage, tested on regtest and testnet
  contract Divide(
      // allowance for party executing the contract
      int executorAllowance,
      // number of outputs receiving payout
      int divisor,

      // for each beneficiary, take the LockingBytecode as input
      bytes r0LockingBytecode,
      bytes r1LockingBytecode
  ) {
      function execute() {

        // distributes to each output in order
        require(tx.outputs[0].lockingBytecode == r0LockingBytecode);
        require(tx.outputs[1].lockingBytecode == r1LockingBytecode);

        // Get the total value of inputs
        int currentValue = tx.inputs[this.activeInputIndex].value;

        // Total value paid to beneficiaries, minus executor allowance
        int distributedValue = currentValue - executorAllowance;

        // Value paid to each beneficiary
        int distribution = distributedValue / divisor;

        // each output must be greater or equal to the distribution amount
        require(tx.outputs[0].value >= distribution);
        require(tx.outputs[1].value >= distribution);
      }
  }`

        expect(expected).toBe(generated)

  });

  
  test("Should generate a contract with 7 outputs", async () => {

    let generated = getV1(7)

    let expected = `pragma cashscript >= 0.7.0;
  // This is an experimental divider contract 
  // Splits input across a range of predetermined outputs
  // Alpha stage, tested on regtest and testnet
  contract Divide(
      // allowance for party executing the contract
      int executorAllowance,
      // number of outputs receiving payout
      int divisor,

      // for each beneficiary, take the LockingBytecode as input
      bytes r0LockingBytecode,
      bytes r1LockingBytecode,
      bytes r2LockingBytecode,
      bytes r3LockingBytecode,
      bytes r4LockingBytecode,
      bytes r5LockingBytecode,
      bytes r6LockingBytecode
  ) {
      function execute() {

        // distributes to each output in order
        require(tx.outputs[0].lockingBytecode == r0LockingBytecode);
        require(tx.outputs[1].lockingBytecode == r1LockingBytecode);
        require(tx.outputs[2].lockingBytecode == r2LockingBytecode);
        require(tx.outputs[3].lockingBytecode == r3LockingBytecode);
        require(tx.outputs[4].lockingBytecode == r4LockingBytecode);
        require(tx.outputs[5].lockingBytecode == r5LockingBytecode);
        require(tx.outputs[6].lockingBytecode == r6LockingBytecode);

        // Get the total value of inputs
        int currentValue = tx.inputs[this.activeInputIndex].value;

        // Total value paid to beneficiaries, minus executor allowance
        int distributedValue = currentValue - executorAllowance;

        // Value paid to each beneficiary
        int distribution = distributedValue / divisor;

        // each output must be greater or equal to the distribution amount
        require(tx.outputs[0].value >= distribution);
        require(tx.outputs[1].value >= distribution);
        require(tx.outputs[2].value >= distribution);
        require(tx.outputs[3].value >= distribution);
        require(tx.outputs[4].value >= distribution);
        require(tx.outputs[5].value >= distribution);
        require(tx.outputs[6].value >= distribution);
      }
  }`

        expect(expected).toBe(generated)

  });
});