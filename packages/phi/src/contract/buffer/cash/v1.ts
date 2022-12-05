// Automatically Generated
export const artifact = {
  "contractName": "Buffer",
  "constructorInputs": [
    {
      "name": "threshold",
      "type": "int"
    },
    {
      "name": "recipientLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "executorAllowance",
      "type": "int"
    }
  ],
  "abi": [
    {
      "name": "execute",
      "inputs": []
    }
  ],
  "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_ROT OP_SUB OP_DUP OP_ROT OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
  "source": "pragma cashscript >= 0.7.1;\n\n// v20221205\n\n// The buffer contract collects small inputs until a certain threshold value is reached.\n// \n// It may be useful for collecting very small inputs, it SHOULD NOT be integrated\n// into any payment flow requiring inputs much larger than the currenct block reward.\n\ncontract Buffer(\n\n  // threshold for output transactions\n  int threshold,\n\n  // LockingBytecode of the beneficiary, the address receiving payments\n  bytes recipientLockingBytecode,\n\n  // extra allowance for administration of contract\n  // fees are paid from executors' allowance. \n  int executorAllowance\n) {\n  function execute() {\n\n    // Check that the first output sends to the recipient\n    require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n        \n    // Get the total value on the contract\n    int currentValue = tx.inputs[this.activeInputIndex].value;\n\n    // Calculate value minus allowance\n    int unlockedValue = currentValue - executorAllowance;\n\n    // require the paid output exceeds the contract value threshold.\n    require(unlockedValue >= threshold);\n\n    // Check that the outputs send the correct amounts\n    require(tx.outputs[0].value >= unlockedValue);\n        \n  }\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.7.2"
  },
  "updatedAt": "2022-12-05T14:22:12.507Z"
}