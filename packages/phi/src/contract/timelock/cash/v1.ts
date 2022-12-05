// Automatically Generated
export const artifact = {
  "contractName": "Lock",
  "constructorInputs": [
    {
      "name": "period",
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
  "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_CHECKSEQUENCEVERIFY OP_DROP OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
  "source": "pragma cashscript >= 0.7.1;\n\n// v20221205\n\n// Relitive or rolling timelock, per utxo\ncontract Lock(\n\n  // interval for payouts, in blocks\n  int period,\n\n  // LockingBytecode of the beneficiary, the address receiving payments\n  bytes recipientLockingBytecode,\n\n  // extra allowance for administration of contract\n  // fees are paid from executors' allowance. \n  int executorAllowance\n) {\n  function execute() {\n\n    // Check that the first output sends to the recipient\n    require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n\n    // Check that time has passed and that time locks are enabled\n    require(tx.age >= period);\n        \n    // Get the total value on the contract\n    int currentValue = tx.inputs[this.activeInputIndex].value;\n\n    // Calculate value minus allowance\n    int unlockedValue = currentValue - executorAllowance;\n\n    // Check that the outputs send the correct amounts\n    require(tx.outputs[0].value >= unlockedValue);\n        \n  }\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.7.2"
  },
  "updatedAt": "2022-12-05T14:22:12.522Z"
}