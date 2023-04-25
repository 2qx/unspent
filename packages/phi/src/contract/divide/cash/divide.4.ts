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
    },
    {
      "name": "r2LockingBytecode",
      "type": "bytes"
    },
    {
      "name": "r3LockingBytecode",
      "type": "bytes"
    }
  ],
  "abi": [
    {
      "name": "execute",
      "inputs": []
    }
  ],
  "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_2 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_3 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_SWAP OP_DIV OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_2 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_3 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
  "source": "pragma cashscript >= 0.7.0;\n  //\n  //  ** AUTOMATICALLY GENEREATED ** see: phi/script/divide.v1.js\n  //\n  // This is an experimental divider contract\n  // Splits input across a range of predetermined outputs\n  // Beta stage\n  contract Divide(\n      // allowance for party executing the contract\n      int executorAllowance,\n      // number of outputs receiving payout\n      int divisor,\n\n      // for each beneficiary, take the LockingBytecode as input\n      bytes r0LockingBytecode,\n      bytes r1LockingBytecode,\n      bytes r2LockingBytecode,\n      bytes r3LockingBytecode\n  ) {\n      function execute() {\n\n        // distributes to each output in order\n        require(tx.outputs[0].lockingBytecode == r0LockingBytecode);\n        require(tx.outputs[1].lockingBytecode == r1LockingBytecode);\n        require(tx.outputs[2].lockingBytecode == r2LockingBytecode);\n        require(tx.outputs[3].lockingBytecode == r3LockingBytecode);\n\n        // Get the total value of inputs\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // Total value paid to beneficiaries, minus executor allowance\n        int distributedValue = currentValue - executorAllowance;\n\n        // Value paid to each beneficiary\n        int distribution = distributedValue / divisor;\n\n        // each output must be greater or equal to the distribution amount\n        require(tx.outputs[0].value >= distribution);\n        require(tx.outputs[1].value >= distribution);\n        require(tx.outputs[2].value >= distribution);\n        require(tx.outputs[3].value >= distribution);\n      }\n  }",
  "compiler": {
    "name": "cashc",
    "version": "0.7.2"
  },
  "updatedAt": "2023-04-13T16:47:20.306Z"
}