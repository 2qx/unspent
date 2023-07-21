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
  "bytecode": "OP_CHECKSEQUENCEVERIFY OP_DROP OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_DUP OP_4 OP_ROLL OP_DIV OP_0 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_DUP e803 OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_2DUP OP_SUB OP_3 OP_PICK OP_SUB OP_1 OP_OUTPUTBYTECODE aa20 OP_ACTIVEBYTECODE OP_HASH256 OP_CAT 87 OP_CAT OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_DROP OP_ELSE OP_OVER OP_3 OP_PICK OP_SUB OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_DROP OP_ENDIF OP_2DROP OP_DROP OP_1",
  "source": "pragma cashscript ^0.8.0;\n\n// Unspent Phi\n//\n// Perpetuity v2 \n//\n// Perpetuity: fractional payments at regular intervals using rolling timelocks.\n//\n// - The input must have aged for a predefined number of blocks (the period)\n// - All utxos must be processed atomically. One coin per tx, no merging.\n// - If installment is greater than 1000 sats, send the remainder back to the contract,\n// - Otherwise, liquidate the contract via a balloon payment to the recipient.\n// \n// String & op_return serializations:\n//\n// P,2,<period>,<receiptLockingBytecode>,<decay>,<contractBytecode>\n// \n// 6a 047574786f\n// 01 50\n// 01 02\n// ...\n//\n\ncontract Perpetuity(\n\n // interval for payouts, in blocks\n int period,\n\n // lockingBytecode of the beneficiary, \n // the address receiving payments\n bytes recipientLockingBytecode,\n\n // extra allowance for administration of contract\n // fees are paid from executors' allowance. \n int executorAllowance,\n\n // divisor for the payout, \n // each payout must be greater than \n // the input amount\n // divided by this number\n int decay\n\n) {\n function execute() {\n\n  // Check that time has passed and that time locks are enabled\n  require(tx.age >= period);\n\n  // Limit to a single utxo input\n  require(tx.inputs.length == 1);\n\n  // Get the input value on the contract\n  int currentValue = tx.inputs[this.activeInputIndex].value;\n\n  // The payout is the current value divided by the decay\n  int installment = currentValue/decay;\n  \n  // Check that the first output sends to the recipient\n  require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n\n  // An installment below the dust threshold isn't spendable\n  if(installment > 1000) {\n\n    // Check that the output sends a normal installment\n    require(tx.outputs[0].value >= installment);\n\n    // Calculate value returned to the contract\n    int returnedValue = currentValue - installment - executorAllowance;\n    \n    // require the second output match the active bytecode\n    require(tx.outputs[1].lockingBytecode == new LockingBytecodeP2SH32(hash256(this.activeBytecode)));\n    \n    // balance was returned to the contract\n    require(tx.outputs[1].value >= returnedValue);\n\n  } else{\n\n    // calculate the remainder of the contract\n    int balloonPaymentValue = currentValue - executorAllowance;\n\n    // Require the balance to be liquidated\n    require(tx.outputs[0].value >= balloonPaymentValue);\n  }\n }\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.8.1"
  },
  "updatedAt": "2023-07-21T16:53:37.377Z"
}