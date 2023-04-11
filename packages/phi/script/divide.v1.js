export function getDivideContract(numParties) {
  let indicies = [...Array(numParties).keys()];
  return (
    `pragma cashscript >= 0.7.0;
  //
  //  ** AUTOMATICALLY GENEREATED ** see: phi/script/divide.v1.js
  //
  // This is an experimental divider contract
  // Splits input across a range of predetermined outputs
  // Beta stage
  contract Divide(
      // allowance for party executing the contract
      int executorAllowance,
      // number of outputs receiving payout
      int divisor,

      // for each beneficiary, take the LockingBytecode as input
` +
    indicies
      .map((i) => `      bytes r${i}LockingBytecode,`)
      .join("\n")
      .slice(0, -1) +
    `
  ) {
      function execute() {

        // distributes to each output in order
` +
    indicies
      .map(
        (i) =>
          `        require(tx.outputs[${i}].lockingBytecode == r${i}LockingBytecode);`
      )
      .join("\n") +
    `

        // Get the total value of inputs
        int currentValue = tx.inputs[this.activeInputIndex].value;

        // Total value paid to beneficiaries, minus executor allowance
        int distributedValue = currentValue - executorAllowance;

        // Value paid to each beneficiary
        int distribution = distributedValue / divisor;

        // each output must be greater or equal to the distribution amount
` +
    indicies
      .map((i) => `        require(tx.outputs[${i}].value >= distribution);`)
      .join("\n") +
    `
      }
  }`
  );
}
