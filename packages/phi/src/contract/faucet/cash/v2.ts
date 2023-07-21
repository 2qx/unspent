// Automatically Generated
export const artifact = {
  "contractName": "Faucet",
  "constructorInputs": [
    {
      "name": "period",
      "type": "int"
    },
    {
      "name": "payout",
      "type": "int"
    },
    {
      "name": "index",
      "type": "int"
    }
  ],
  "abi": [
    {
      "name": "drip",
      "inputs": []
    }
  ],
  "bytecode": "OP_CHECKSEQUENCEVERIFY OP_DROP OP_SWAP OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_2DUP OP_SWAP OP_SUB OP_SWAP OP_ROT OP_GREATERTHAN OP_IF OP_0 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTBYTECODE aa20 OP_ACTIVEBYTECODE OP_HASH256 OP_CAT 87 OP_CAT OP_EQUALVERIFY OP_ENDIF OP_DROP OP_1",
  "source": "pragma cashscript ^0.8.1;\n\n// Unspent Phi\n//\n// Faucet v2 \n//\n// Faucet: pay to anyone at intervals using rolling timelocks.\n// \n// - The input must have aged for a predefined number of blocks (the period)\n// - All utxos must be processed atomically. One coin per tx, no merging.\n// - If enough funds exist for future payout, send the remainder back to the contract,\n// - Otherwise, allow liquidation of the contract via a balloon payment to the recipient.\n// \n// Implementation notes: contract requires 32-byte locking bytecode style address.\n// \n// String & op_return serializations:\n//\n// F,2,<period>,<payout>,<index>,<contractBytecode>\n// \n// 6a 047574786f\n// 01 46\n// 01 02\n// ...\n\ncontract Faucet(\n\n  // interval for payouts, in blocks\n  int period,\n\n  // amount to be paid by faucet allowance. \n  int payout,\n\n  // random number input into contract to have more than one\n  int index\n  \n) {\n  function drip() {\n\n    // Check that time has passed and that time locks are enabled\n    require(tx.age >= period);\n      \n    // use the index\n    require(index >= 0);\n\n    // Limit to a single utxo input\n    require(tx.inputs.length == 1);\n    \n    // Get the total value on the contract\n    int currentValue = tx.inputs[this.activeInputIndex].value;\n\n    // Calculate value returned to the contract\n    int returnedValue = currentValue - payout;\n\n    // If the value on the contract exceeds the payout amount\n    // then assert that the value must return to the contract\n    if(currentValue > payout){\n\n      // return the balance to the contract\n      require(tx.outputs[0].value >= returnedValue);\n      \n      // require the first output to match the active bytecode\n      require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2SH32(hash256(this.activeBytecode)));\n\n    } // otherwise output is unrestricted.\n\n  }\n\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.8.1"
  },
  "updatedAt": "2023-07-21T16:53:37.353Z"
}