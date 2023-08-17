// Automatically Generated
export const artifact = {
  "contractName": "Record",
  "constructorInputs": [
    {
      "name": "maxFee",
      "type": "int"
    },
    {
      "name": "index",
      "type": "int"
    }
  ],
  "abi": [
    {
      "name": "execute",
      "inputs": [
        {
          "name": "dataHash",
          "type": "bytes20"
        }
      ]
    }
  ],
  "bytecode": "OP_SWAP OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_HASH160 OP_ROT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY b900 OP_0 OP_OUTPUTBYTECODE OP_SIZE OP_NIP OP_ADD OP_DUP OP_ROT OP_LESSTHANOREQUAL OP_VERIFY OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_DUP e803 OP_GREATERTHANOREQUAL OP_IF OP_1 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_DROP OP_1",
  "source": "pragma cashscript ^0.8.0;\n\n// Unspent Phi\n//\n// Record v2 \n//\n// Record: fractional payments at regular intervals using rolling timelocks.\n//\n// - The input must have aged for a predefined number of blocks (the period)\n// - All utxos must be processed atomically. One coin per tx, no merging.\n// - If installment is greater than 1000 sats, send the remainder back to the contract,\n// - Otherwise, liquidate the contract via a balloon payment to the recipient.\n// \n// String & op_return serializations:\n//\n// R,2,<maxFee>,<index>,<contractBytecode>\n// \n// 6a 047574786f\n// 01 52\n// 01 02\n// ...\n//\n\n\n/* Allows publishing some OP_RETURN message,\n * given that:\n * 1. the hash160 value of the zero value OP_RETURN message is passed\n * 2. the first output has zero value\n * 3. the remaining value is pass back to the contract, mostly.\n */\n\n \ncontract Record(int maxFee, int index) {\n\n  // Allow publishing any message \n  //  if the hash160 digest of the message checks.\n function execute(bytes20 dataHash) {\n\n  // this does nothing\n  // different indicies enable different contract addresses\n  require(index >= 0);\n\n  // Limit to a single utxo input\n  require(tx.inputs.length == 1);\n\n  // Check that the first tx output is a zero value \n  //  opcode matching the provided hash\n  require(hash160(tx.outputs[0].lockingBytecode) == dataHash);\n  require(tx.outputs[0].value == 0);\n  \n  // Calculate the fee required to\n  //   propagate the transaction 1 sat/ byte\n  int baseFee = 185;\n  \n  int fee = baseFee + tx.outputs[0].lockingBytecode.length;\n  require(fee<=maxFee);\n\n  // Get the value of the input\n  int newValue = tx.inputs[this.activeInputIndex].value - fee;\n\n  // If some value remains, return it to the contract,\n  if(newValue >= 1000){\n    require(tx.outputs[1].lockingBytecode == tx.inputs[0].lockingBytecode);\n    require(tx.outputs[1].value >= newValue);    \n  }  // otherwise, allow balance to be spent in an unrestricted manner.\n }\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.8.1"
  },
  "updatedAt": "2023-08-14T15:56:03.157Z"
}