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
  "bytecode": "OP_TXVERSION OP_2 OP_GREATERTHANOREQUAL OP_VERIFY OP_CHECKSEQUENCEVERIFY OP_DROP OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_0 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_2DUP OP_SWAP OP_2 OP_MUL OP_GREATERTHAN OP_IF OP_2DUP OP_SWAP OP_SUB OP_3 OP_PICK OP_SUB OP_0 OP_OUTPUTVALUE OP_3 OP_PICK OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTBYTECODE aa20 OP_ACTIVEBYTECODE OP_HASH256 OP_CAT 87 OP_CAT OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_DROP OP_ELSE OP_DUP OP_3 OP_PICK OP_SUB OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_DROP OP_ENDIF OP_2DROP OP_DROP OP_1",
  "source": "pragma cashscript ^0.8.1;\n\n// Unspent Phi\n//\n// Annuity v2 \n//\n// Annuity: equal payments at regular intervals using rolling timelocks.\n//\n// - The input must have aged for a predefined number of blocks (the period)\n// - All utxos must be processed atomically. One coin per tx, no merging.\n// - If enough funds exist for future payments, send the remainder back to the contract,\n// - Otherwise, liquidate the contract via a balloon payment to the recipient.\n// \n// Implementation notes: contract requires 32-byte locking bytecode style address.\n// \n// String & op_return serializations:\n//\n// A,2,<period>,<receiptLockingBytecode>,<installment>,<contractBytecode>\n// \n// 6a 047574786f\n// 01 41\n// 01 02\n// ...\n\ncontract Annuity(\n\n  // interval for payouts, in blocks\n  int period,\n\n  // LockingBytecode of the beneficiary, the address receiving payments\n  bytes recipientLockingBytecode,\n\n  // amount paid in each installment\n  int installment,\n\n  // extra allowance for administration of contract\n  // fees are paid from executors' allowance. \n  int executorAllowance\n) {\n  function execute() {\n\n    // Force tx version 2 to force BIP68 support\n    require(tx.version >= 2);\n\n    // Assure a rolling timelock is satisfied\n    require(tx.age >= period);\n\n    // Limit to a single utxo input\n    require(tx.inputs.length == 1);\n\n    // Get the utxo value \n    int currentValue = tx.inputs[this.activeInputIndex].value;\n  \n    // Check that the first output sends to the intended recipient. \n    require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n\n    // if enough funds exist for a least two more payments,\n    // return the balance to the contract, minus executor's fee.\n    if(currentValue > installment*2){\n      // Calculate the value returned by the contract\n      int returnedValue = currentValue - installment - executorAllowance;\n\n      // Check that the outputs send the correct amounts\n      require(tx.outputs[0].value >= installment);\n\n      // require the second output to match the active bytecode\n      require(tx.outputs[1].lockingBytecode == new LockingBytecodeP2SH32(hash256(this.activeBytecode)));\n      require(tx.outputs[1].value >= returnedValue);\n    } \n    // Otherwise, send a final balloon payment instead of a partial payment\n    else{\n      int balloonPaymentValue = currentValue - executorAllowance;\n      // Check that the outputs send the correct amounts\n      require(tx.outputs[0].value >= balloonPaymentValue);\n    }\n  }\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.8.1"
  },
  "updatedAt": "2023-07-27T13:41:58.496Z"
}