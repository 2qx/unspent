// Automatically Generated
export const artifact = {
  "contractName": "Divide",
  "constructorInputs": [
    {
      "name": "executorAllowance",
      "type": "int"
    },
    {
      "name": "divisor",
      "type": "int"
    },
    {
      "name": "r0LockingBytecode",
      "type": "bytes"
    },
    {
      "name": "r1LockingBytecode",
      "type": "bytes"
    }
  ],
  "abi": [
    {
      "name": "execute",
      "inputs": []
    }
  ],
  "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_SWAP OP_DIV OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
  "source": "pragma cashscript ^0.8.1;\n  //\n  //  ** AUTOMATICALLY GENEREATED ** see: phi/script/divide.v2.js\n  //\n  // This is an experimental divider contract\n  // Splits input across a range of predetermined outputs\n  // Beta stage\n  contract Divide(\n      // allowance for party executing the contract\n      int executorAllowance,\n      // number of outputs receiving payout\n      int divisor,\n\n      // for each beneficiary, take the LockingBytecode as input\n      bytes r0LockingBytecode,\n      bytes r1LockingBytecode\n  ) {\n      function execute() {\n\n        // distributes to each output in order\n        require(tx.outputs[0].lockingBytecode == r0LockingBytecode);\n        require(tx.outputs[1].lockingBytecode == r1LockingBytecode);\n        \n        // Limit to a single utxo input\n        require(tx.inputs.length == 1);\n\n        // Get the value of the input\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // Value paid to beneficiaries, minus executor allowance\n        int distributedValue = currentValue - executorAllowance;\n\n        // Value paid to each beneficiary\n        int distribution = distributedValue / divisor;\n\n        // each output must be greater or equal to the distribution amount\n        require(tx.outputs[0].value >= distribution);\n        require(tx.outputs[1].value >= distribution);\n      }\n  }",
  "compiler": {
    "name": "cashc",
    "version": "0.8.1"
  },
  "updatedAt": "2023-07-21T16:53:37.260Z"
}