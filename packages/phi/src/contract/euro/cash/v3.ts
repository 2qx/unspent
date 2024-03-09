// Automatically Generated
export const artifact = {
  "contractName": "FutureBCH",
  "constructorInputs": [
    {
      "name": "locktime",
      "type": "int"
    },
    {
      "name": "tokenCategory",
      "type": "bytes"
    }
  ],
  "abi": [
    {
      "name": "placeOrRedeem",
      "inputs": [
        {
          "name": "isRedeem",
          "type": "bool"
        }
      ]
    }
  ],
  "bytecode": "OP_ROT OP_IF OP_DUP OP_CHECKLOCKTIMEVERIFY OP_DROP OP_1 OP_UTXOTOKENCATEGORY OP_2 OP_PICK OP_EQUALVERIFY OP_ELSE OP_0 OP_UTXOTOKENAMOUNT 00e1f505 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCATEGORY OP_2 OP_PICK OP_EQUALVERIFY OP_1 OP_UTXOVALUE 00e1f505 OP_NUMEQUALVERIFY OP_1 OP_OUTPUTTOKENCATEGORY OP_2 OP_PICK OP_EQUALVERIFY OP_ENDIF OP_INPUTINDEX OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOTOKENAMOUNT OP_INPUTINDEX OP_UTXOVALUE OP_ADD OP_INPUTINDEX OP_OUTPUTTOKENAMOUNT OP_INPUTINDEX OP_OUTPUTVALUE OP_ADD OP_NUMEQUAL OP_NIP OP_NIP",
  "source": "pragma cashscript ^0.10.0;\n\n// Future BCH fungible token vault\n//\n//      Inputs: 00-covenant\n//      Outputs: 00-covenant\n//\n\ncontract FutureBCH(int locktime, bytes tokenCategory) {\n\n    function placeOrRedeem(bool isRedeem) {\n\n        //  Flow\n        //  00 contract    ->  00 contract\n        //  01 userPkh     =>  01 userPkh\n        //  02 coupons     ^\n\n        // enforce BIP65 timelocks and the direction of the swap \n        if(isRedeem){\n          // tokens may be redeemed in any amount after the future has matured\n          require(tx.time >= locktime);\n          require(tx.inputs[1].tokenCategory == tokenCategory);\n        } else{\n          // otherwise, only whole coins may be \"placed\" or locked\n          // And the token id must match a pre-configured token\n          require(tx.inputs[0].tokenAmount == 100000000);\n          require(tx.inputs[0].tokenCategory == tokenCategory);\n          require(tx.inputs[1].value == 100000000);\n          require(tx.outputs[1].tokenCategory == tokenCategory);\n        }\n\n        // Enforce that this contract lives on\n        require(\n          tx.outputs[this.activeInputIndex].lockingBytecode \n          == \n          tx.inputs[this.activeInputIndex].lockingBytecode, \n          \"locking bytecode index mismatch\"\n          );\n\n        require(\n          tx.inputs[this.activeInputIndex].tokenAmount + \n          tx.inputs[this.activeInputIndex].value \n          == \n          tx.outputs[this.activeInputIndex].tokenAmount + \n          tx.outputs[this.activeInputIndex].value,\n         \"summation mismatch\"\n         );\n    }\n}",
  "debug": {
    "bytecode": "527a630079b17551ce527987696700d00400e1f5059c6900ce5279876951c60400e1f5059c6951d15279876968c0cdc0c78769c0d0c0c693c0d3c0cc939c7777",
    "sourceMap": "19:11:19:19;;:20:23:9;21:29:21:37;;:10::39:1;;22:28:22:29:0;:18::44;:48::61;;:18:::1;:10::63;23:14:30:9;26:28:26:29:0;:18::42;:46::55;:18:::1;:10::57;27:28:27:29:0;:18::44;:48::61;;:18:::1;:10::63;28:28:28:29:0;:18::36;:40::49;:18:::1;:10::51;29:29:29:30:0;:18::45;:49::62;;:18:::1;:10::64;23:14:30:9;34:21:34:42:0;:10::59;36:20:36:41;:10::58;34::::1;33:8:38:12;41:20:41:41:0;:10::54;42:20:42:41;:10::48;41::::1;44:21:44:42:0;:10::55;45:21:45:42;:10::49;44::::1;41;11:4:48:5;",
    "logs": [],
    "requireMessages": [
      {
        "ip": 44,
        "line": 33,
        "message": "locking bytecode index mismatch"
      },
      {
        "ip": 56,
        "line": 40,
        "message": "summation mismatch"
      }
    ]
  },
  "compiler": {
    "name": "cashc",
    "version": "0.10.0-next.2"
  },
  "updatedAt": "2024-02-26T17:26:33.035Z"
}