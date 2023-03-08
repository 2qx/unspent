// Automatically Generated
export const artifact = {
  "contractName": "Mine",
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
      "name": "difficulty",
      "type": "int"
    },
    {
      "name": "canary",
      "type": "bytes7"
    }
  ],
  "abi": [
    {
      "name": "execute",
      "inputs": [
        {
          "name": "nonce",
          "type": "bytes7"
        }
      ]
    }
  ],
  "bytecode": "OP_DUP OP_CHECKSEQUENCEVERIFY OP_DROP OP_3 OP_ROLL OP_SIZE OP_NIP OP_7 OP_NUMEQUALVERIFY OP_1 OP_1 OP_NUM2BIN OP_0 OP_7 OP_NUM2BIN OP_ACTIVEBYTECODE OP_6 OP_PICK OP_CAT OP_SHA256 OP_5 OP_PICK OP_SPLIT OP_DROP OP_SWAP OP_5 OP_PICK OP_SPLIT OP_DROP OP_EQUALVERIFY OP_7 OP_5 OP_PICK OP_CAT OP_ACTIVEBYTECODE OP_8 OP_SPLIT OP_NIP OP_CAT OP_HASH160 a914 OP_SWAP OP_CAT 87 OP_CAT 6a 7574786f OP_SIZE OP_SWAP OP_CAT OP_CAT 4d OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_ROT OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_ROT OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_2 OP_PICK OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_3 OP_ROLL OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_3 OP_ROLL OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_OVER OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_2DUP OP_SWAP OP_SUB OP_SWAP OP_ROT OP_GREATERTHAN OP_IF OP_1 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_0 OP_OUTPUTVALUE OP_0 OP_NUMEQUAL OP_NIP",
  "source": "  pragma cashscript >= 0.7.1;\n\n  // v20220727\n\n  // A faucet with proof of work.\n  contract Mine(\n\n    // interval for payouts, in blocks\n    int period,\n\n    // amount to be paid by faucet allowance. \n    int payout,\n\n    // how many leading zeros should the nonce and currenct bytecode have\n    int difficulty,\n\n    // the old nonce, which is replaced each time.\n    bytes7 canary\n  ) {\n    function execute(bytes7 nonce) {\n\n      // Check that time has passed and that time locks are enabled\n      require(tx.age >= period);\n        \n      // Use the old nonce \n      require(canary.length==7);\n\n      // Check that the new nonce creates a hash with difficulty leading zeros when hashed with the active bytecode\n      bytes version = byte(1);\n      bytes zeros = bytes7(0);\n      bytes hash = sha256(this.activeBytecode + bytes7(nonce));\n      require(hash.split(difficulty)[0] == zeros.split(difficulty)[0]);\n\n      // calculate the new locking bytecode\n      bytes newContract = 0x7 + bytes7(nonce) + this.activeBytecode.split(8)[1];\n      bytes20 contractHash = hash160(newContract);\n      bytes23 lockingCode = new LockingBytecodeP2SH(contractHash);\n\n\n      // Require the first output details the parameters of the mining contract in a zero value OP_RETURN\n      bytes announcement = new LockingBytecodeNullData([\n        // The protocol\n        0x7574786f,\n        // M for mining contract\n        bytes('M'),\n        // version\n        bytes(version),\n        // The period, \n        bytes(period),\n        // The payout, \n        bytes(payout),\n        // preceeding zeros on solution\n        bytes(difficulty),\n        // The current nonce (future canary), of the mining contract funds are similtaniously sent to\n        bytes(nonce),\n        // The new bytecode\n        bytes(lockingCode)\n      ]);\n\n      // Assure that the first output matches the arguments to the contract\n      require(tx.outputs[0].lockingBytecode == announcement);\n\n      // check that the change output sends to that contract\n      require(tx.outputs[1].lockingBytecode == lockingCode);\n      \n      // Get the total value on the contract\n      int currentValue = tx.inputs[this.activeInputIndex].value;\n\n      // Calculate value returned to the contract\n      int returnedValue = currentValue - payout;\n\n      // If the value on the contract exceeds the payout amount\n      // then assert that the value must return to the contract\n      if(currentValue > payout){\n      require(tx.outputs[1].value >= returnedValue);\n      }\n\n      // Assure it has zero value\n      require(tx.outputs[0].value == 0);\n    }\n\n  }",
  "compiler": {
    "name": "cashc",
    "version": "0.7.2"
  },
  "updatedAt": "2023-03-07T14:05:05.738Z"
}