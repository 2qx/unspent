// Automatically Generated
export const artifact = {
  "contractName": "Annuity",
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
      "name": "installment",
      "type": "int"
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
  "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_CHECKSEQUENCEVERIFY OP_DROP OP_1 OP_OUTPUTBYTECODE a914 OP_ACTIVEBYTECODE OP_HASH160 OP_CAT 87 OP_CAT OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_OVER OP_SUB OP_ROT OP_SUB OP_0 OP_OUTPUTVALUE OP_ROT OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
  "source": "pragma cashscript >= 0.7.1;\n\n// v202205626\n\n// Pay equal payments at regular intervals using input locks\ncontract Annuity(\n\n  // interval for payouts, in blocks\n  int period,\n\n  // LockingBytecode of the beneficiary, the address receiving payments\n  bytes recipientLockingBytecode,\n\n  // amount paid in each installment\n  int installment,\n\n  // extra allowance for administration of contract\n  // fees are paid from executors' allowance. \n  int executorAllowance\n) {\n  function execute() {\n\n    // Check that the first output sends to the recipient\n    require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n\n    // Check that time has passed and that time locks are enabled\n    require(tx.age >= period);\n        \n    // require the second output to match the active bytecode\n    require(tx.outputs[1].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));\n\n    // Get the total value on the contract\n    int currentValue = tx.inputs[this.activeInputIndex].value;\n\n    // Calculate value returned to the contract\n    int returnedValue = currentValue - installment - executorAllowance;\n\n    // Check that the outputs send the correct amounts\n    require(tx.outputs[0].value >= installment);\n    require(tx.outputs[1].value >= returnedValue);\n        \n  }\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.7.2"
  },
  "updatedAt": "2023-04-13T16:47:20.285Z"
}