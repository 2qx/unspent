// Automatically Generated
export const artifact = {
  "contractName": "Locktime",
  "constructorInputs": [
    {
      "name": "locktime",
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
  "bytecode": "OP_CHECKLOCKTIMEVERIFY OP_DROP OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
  "source": "pragma cashscript >= 0.7.1;\n\n// Unspent Phi\n//\n// Locktime v2 \n//\n// Locktime: lock funds using using Locktimes.\n//\n// - The input must have aged for a predefined number of blocks (the period)\n// - All utxos must be processed atomically. One coin per tx, no merging.\n// - If installment is greater than 1000 sats, send the remainder back to the contract,\n// - Otherwise, liquidate the contract via a balloon payment to the recipient.\n// \n// String & op_return serializations:\n//\n// L,2,<Locktime>,<receiptLockingBytecode>,<executorAllowance>,<contractBytecode>\n// \n// 6a 047574786f\n// 01 50\n// 01 02\n// ...\n//\n\n// Relative or rolling Locktimes, per utxo.\n// This contract requires input be sufficently aged \n// according to BIP68 relative time locks.\n\ncontract Locktime(\n\n  // length of time to lock contract, blocks\n  int locktime,\n\n  // LockingBytecode of the beneficiary, the address receiving payments\n  bytes recipientLockingBytecode,\n\n  // extra allowance for administration of contract\n  // fees are paid from executors' allowance. \n  int executorAllowance\n) {\n  function execute() {\n\n    // Check that time has passed and that time locks are enabled\n    require(tx.time >= locktime);\n\n    // Limit to a single utxo input,\n    // all inputs must be spent atomically.\n    require(tx.inputs.length == 1);\n\n    // Check that the first output sends to the recipient\n    require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n\n    // Get the total value of the input the contract\n    int currentValue = tx.inputs[this.activeInputIndex].value;\n\n    // Calculate value minus allowance\n    int unlockedValue = currentValue - executorAllowance;\n\n    // Check that the outputs send the correct amount\n    require(tx.outputs[0].value >= unlockedValue);\n        \n  }\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.8.1"
  },
  "updatedAt": "2023-07-21T16:53:37.356Z"
}