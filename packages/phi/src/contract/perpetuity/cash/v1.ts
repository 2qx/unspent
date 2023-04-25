// Automatically Generated
export const artifact = {
  "contractName": "Perpetuity",
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
    },
    {
      "name": "decay",
      "type": "int"
    }
  ],
  "abi": [
    {
      "name": "execute",
      "inputs": []
    }
  ],
  "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_CHECKSEQUENCEVERIFY OP_DROP OP_1 OP_OUTPUTBYTECODE a914 OP_ACTIVEBYTECODE OP_HASH160 OP_CAT 87 OP_CAT OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_DUP OP_3 OP_ROLL OP_DIV OP_SWAP OP_OVER OP_SUB OP_ROT OP_SUB OP_0 OP_OUTPUTVALUE OP_ROT OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
  "source": "pragma cashscript >= 0.7.1;\n\n// v20220522\n\n// This is an experimental perpetuity contract \n// Beta stage\ncontract Perpetuity(\n\n // interval for payouts, in blocks\n int period,\n\n // lockingBytecode of the beneficiary, \n // the address receiving payments\n bytes recipientLockingBytecode,\n\n // extra allowance for administration of contract\n // fees are paid from executors' allowance. \n int executorAllowance,\n\n // divisor for the payout, \n // each payout must be greater than \n // the total amount held on the contract\n //  divided by this number\n int decay\n) {\n function execute() {\n\n  // Check that the first output sends to the recipient\n  require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n\n  // Check that time has passed and that time locks are enabled\n  require(tx.age >= period);\n   \n  // require the second output to match the active bytecode\n  require(tx.outputs[1].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));\n\n\n  // Get the total value on the contract\n  int currentValue = tx.inputs[this.activeInputIndex].value;\n\n  // The payout is the current value divided by the decay\n  int installment = currentValue/decay;\n\n  // Calculate value returned to the contract\n  int returnedValue = currentValue - installment - executorAllowance;\n\n  // Check that the outputs send the correct amounts\n  require(tx.outputs[0].value >= installment);\n  require(tx.outputs[1].value >= returnedValue);\n   \n }\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.7.2"
  },
  "updatedAt": "2023-04-13T16:47:20.381Z"
}