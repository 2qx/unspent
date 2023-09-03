// Automatically Generated
export const artifact = {
  "contractName": "Window",
  "constructorInputs": [
    {
      "name": "rate",
      "type": "int"
    }
  ],
  "abi": [
    {
      "name": "deposit",
      "inputs": [
        {
          "name": "recipientLockingBytecode",
          "type": "bytes"
        },
        {
          "name": "locktime",
          "type": "int"
        }
      ]
    }
  ],
  "bytecode": "OP_INPUTINDEX OP_UTXOVALUE OP_1 OP_UTXOVALUE OP_4 OP_PICK OP_3 OP_ROLL OP_MUL OP_OVER OP_MUL 00e1f505 OP_DIV OP_2 OP_PICK OP_OVER OP_GREATERTHAN OP_VERIFY OP_SWAP OP_OVER OP_ADD OP_ROT OP_ROT OP_SUB OP_3 OP_PICK b004 OP_4 OP_NUM2BIN OP_CAT OP_3 OP_ROLL OP_CAT b175c3519d00cd88c0c67c9400cca1 OP_CAT aa20 OP_SWAP OP_HASH256 OP_CAT 87 OP_CAT OP_0 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_3 OP_ROLL OP_LESSTHANOREQUAL OP_VERIFY 6a 7574786f OP_SIZE OP_SWAP OP_CAT OP_CAT 4c OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_2 OP_1 OP_NUM2BIN OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_3 OP_ROLL OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT b004 OP_4 OP_NUM2BIN OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_SWAP OP_SIZE OP_DUP 4b OP_GREATERTHAN OP_IF 4c OP_SWAP OP_CAT OP_ENDIF OP_SWAP OP_CAT OP_CAT OP_1 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY OP_DUP e803 OP_GREATERTHAN OP_IF OP_2 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_2 OP_OUTPUTVALUE OP_OVER OP_GREATERTHANOREQUAL OP_VERIFY OP_ENDIF OP_DROP OP_1",
  "source": "pragma cashscript ^0.8.0;\n\ncontract Window(\n  // deposit rate in sat per coin per block\n  int rate // \n) {\n\n    function deposit(\n        bytes recipientLockingBytecode,\n        int locktime\n        ) {\n\n        // 0 bank      -\\/-> deposit + coupon >> receipt\n        // 1 deposit   -/\\-> L,1,<locktime> OP_RETURN\n        //               |-> contract - coupon >> vault\n        //                   \n\n        // Get the current value on the contract\n        int bankValue = tx.inputs[this.activeInputIndex].value;\n\n        // The depositer input\n        int depositValue = tx.inputs[1].value;\n\n        int coupon = (locktime*rate*depositValue/100000000);\n\n        // assure the bank is able to accommodate the deposit\n        require(bankValue > coupon);\n\n        int maturity = depositValue+coupon;\n        int vaultRemainder = bankValue-coupon;\n\n        // calculate the deposit script\n        bytes depositScript = bytes(locktime) + bytes4(1200) + bytes(recipientLockingBytecode) + 0xb175c3519d00cd88c0c67c9400cca1;\n\n        bytes depositLock = new LockingBytecodeP2SH32(hash256(depositScript));\n        require(tx.outputs[0].lockingBytecode == depositLock);\n        require(tx.outputs[0].value <= maturity);\n\n        // broadcast lock\n        bytes announcement = new LockingBytecodeNullData([\n            // The protocol\n            0x7574786f,\n            // L for lock contract\n            bytes('L'),\n            // version\n            bytes1(2),\n            // The locktime,\n            bytes(locktime),\n            // The executorFee,\n            bytes4(1200),\n            // The new bytecode\n            bytes(depositLock)\n        ]);\n\n        // broadcast the lock contract\n        require(tx.outputs[1].lockingBytecode == announcement);\n        // Assure it has zero value\n        require(tx.outputs[1].value == 0);\n\n        if(vaultRemainder > 1000){\n          // if remainder is greater than dust value, return it\n          // assure the vault-coupon returns to the bank\n          require(tx.outputs[2].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);\n          require(tx.outputs[2].value >= vaultRemainder); \n        }\n\n        \n    }\n}\n",
  "compiler": {
    "name": "cashc",
    "version": "0.8.1"
  },
  "updatedAt": "2023-08-31T19:17:59.048Z"
}