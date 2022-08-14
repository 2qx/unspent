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
  "bytecode": "OP_DUP OP_CHECKSEQUENCEVERIFY OP_DROP OP_3 OP_ROLL OP_SIZE OP_NIP OP_7 OP_NUMEQUALVERIFY OP_0 OP_7 OP_NUM2BIN OP_ACTIVEBYTECODE OP_5 OP_PICK OP_CAT OP_SHA256 OP_4 OP_PICK OP_SPLIT OP_DROP OP_SWAP OP_4 OP_PICK OP_SPLIT OP_DROP OP_EQUALVERIFY 6a 62616e6b OP_SIZE OP_SWAP OP_CAT OP_CAT 4d OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_SWAP OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_OVER OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_ROT OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_2 OP_PICK OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_2DUP OP_SWAP OP_SUB OP_SWAP OP_ROT OP_GREATERTHAN OP_IF OP_7 OP_2 OP_PICK OP_CAT OP_ACTIVEBYTECODE OP_8 OP_SPLIT OP_NIP OP_CAT OP_DUP OP_HASH160 a914 OP_OVER OP_CAT 87 OP_CAT OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_4 OP_PICK OP_GREATERTHANOREQUAL OP_VERIFY OP_2DROP OP_DROP OP_ENDIF OP_2DROP OP_1",
  "source": "pragma cashscript >= 0.7.1;\n\n// v20220727\n\n\n\n// Unfinished, untested.\ncontract Mine(\n\n    // interval for payouts, in blocks\n    int period,\n\n    // amount to be paid by faucet allowance. \n    int payout,\n\n    // how many leading zeros should the nonce and currenct bytecode have\n    int difficulty,\n\n    // the old nonce, which is replaced each time.\n    bytes7 canary\n) {\n    function execute(bytes7 nonce) {\n\n        // Check that time has passed and that time locks are enabled\n        require(tx.age >= period);\n            \n        // Use the old nonce \n        require(canary.length==7);\n\n        // Get the total value on the contract\n        bytes zeros = bytes7(0);\n        bytes hash = sha256(this.activeBytecode + bytes7(nonce));\n        require(hash.split(difficulty)[0] == zeros.split(difficulty)[0]);\n\n        // Require the first output to detail the parameters of the mining contract in a zero value OP_RETURN\n        bytes announcement = new LockingBytecodeNullData([\n            // The protocol\n            0x62616e6b,\n            // M for mining contract\n            bytes('M'),\n            // The period, little-endian \n            bytes(period),\n            // The payout, little-endian \n            bytes(payout),\n            // preceeding zeros on solution\n            bytes(difficulty),\n            // The current nonce (future canary), of the mining contract funds are similtaniously sent to\n            bytes(nonce)\n        ]);\n\n        // Assure that the first output matches the arguments to the contract\n        require(tx.outputs[0].lockingBytecode == announcement);\n\n        // Assure it has zero value\n        require(tx.outputs[0].value == 0);\n\n        // Get the total value on the contract\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // Calculate value returned to the contract\n        int returnedValue = currentValue - payout;\n\n        // If the value on the contract exceeds the payout amount\n        if(currentValue > payout){\n           // Create the locking bytecode for the new contract and check that\n           // the change output sends to that contract\n           bytes newContract = 0x7 + bytes7(nonce) + this.activeBytecode.split(8)[1];\n           bytes20 contractHash = hash160(newContract);\n           bytes23 lockingCode = new LockingBytecodeP2SH(contractHash);\n           require(tx.outputs[1].lockingBytecode == lockingCode);\n           require(tx.outputs[1].value >= returnedValue);\n        }\n    }\n\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.7.2"
  },
  "updatedAt": "2022-08-04T13:08:46.215Z"
}