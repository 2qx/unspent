// Automatically Generated
export const artifact = {
  "contractName": "Succession",
  "constructorInputs": [
    {
      "name": "tokenCategory",
      "type": "bytes"
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
    },
    {
      "name": "assign",
      "inputs": [
        {
          "name": "assignor",
          "type": "pubkey"
        },
        {
          "name": "assignorSig",
          "type": "sig"
        },
        {
          "name": "assignee",
          "type": "bytes"
        }
      ]
    }
  ],
  "bytecode": "OP_2 OP_PICK OP_0 OP_NUMEQUAL OP_IF OP_TXINPUTCOUNT OP_2 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_0 OP_UTXOTOKENCOMMITMENT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_UTXOVALUE OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT 20 OP_SPLIT OP_DROP OP_1 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_1 OP_UTXOVALUE OP_SWAP OP_SUB OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL OP_NIP OP_ELSE OP_ROT OP_1 OP_NUMEQUALVERIFY OP_3 OP_ROLL OP_3 OP_PICK OP_CHECKSIGVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_0 OP_UTXOBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCATEGORY OP_0 OP_UTXOTOKENCATEGORY OP_EQUALVERIFY OP_0 OP_OUTPUTTOKENCOMMITMENT OP_3 OP_ROLL OP_EQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT OP_ROT OP_EQUALVERIFY OP_TXOUTPUTCOUNT OP_1 OP_NUMEQUAL OP_NIP OP_ENDIF",
  "source": "pragma cashscript ^0.10.0;\n\ncontract Succession(\n  bytes tokenCategory,\n  int executorAllowance,\n) {\n\n  //\n  // relay (forward) funds  to the assignee designated by the commitment\n  //\n\n  // input[0] nft => output[0] nft\n  // input[1] bch => output[1]  -> assignee\n  //             |=> output[2] ?-> executor\n\n  function execute() {\n\n    // Limit to exactly two utxo inputs\n    require(tx.inputs.length == 2);\n\n    require(tx.outputs[0].tokenCategory == tokenCategory);\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory);\n    \n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n    require(tx.outputs[0].nftCommitment == tx.inputs[0].nftCommitment);\n\n    require(tx.outputs[0].value == tx.inputs[0].value);\n\n    bytes ntfCommitmentData = tx.inputs[0].nftCommitment;\n    bytes assignee = ntfCommitmentData.split(32)[0];\n    require(tx.outputs[1].lockingBytecode == assignee);\n\n    // Get the value of the input\n    int currentValue = tx.inputs[1].value;\n\n    // Value paid to beneficiaries, minus executor allowance\n    int distribution = currentValue - executorAllowance;\n    require(tx.outputs[0].value >= distribution);\n\n  }\n\n  //\n  // reassign the commitment to refer at a new assignee\n  // \n  function assign(pubkey assignor, sig assignorSig, bytes assignee) {\n\n    // require the old assignor sign for when assigning the enw destination.\n    require(checkSig(assignorSig, assignor));\n\n    // Output#0 preserves the NFT minting contract with same minting nft\n    require(tx.outputs[0].tokenCategory == tokenCategory);\n    require(tx.outputs[0].lockingBytecode == tx.inputs[0].lockingBytecode);\n    require(tx.outputs[0].tokenCategory == tx.inputs[0].tokenCategory);\n\n    require(tx.outputs[0].nftCommitment == assignee);\n    require(tx.inputs[0].nftCommitment == assignor);\n\n    // Limit to a single utxo input\n    require(tx.outputs.length == 1);\n\n  }\n}",
  "debug": {
    "bytecode": "5279009c63c3529c6900d1517a876900d100ce876900cd00c7876900d200cf876900cc00c69c6900cf007a01207f7551cd517a876951c6007a517a9400cc517aa27767527a519c69537a5379ac6900d1517a876900cd00c7876900d100ce876900d2537a876900cf527a8769c4519c7768",
    "sourceMap": "16:2:40:3;;;;;19:12:19:28;:32::33;:12:::1;:4::35;21:23:21:24:0;:12::39;:43::56;;:12:::1;:4::58;22:23:22:24:0;:12::39;:53::54;:43::69;:12:::1;:4::71;24:23:24:24:0;:12::41;:55::56;:45::73;:12:::1;:4::75;25:23:25:24:0;:12::39;:53::54;:43::69;:12:::1;:4::71;27:23:27:24:0;:12::31;:45::46;:35::53;:12:::1;:4::55;29:40:29:41:0;:30::56;30:21:30:38;;:45::47;:21::48:1;:::51;31:23:31:24:0;:12::41;:45::53;;:12:::1;:4::55;34:33:34:34:0;:23::41;37::37:35;;:38::55;;:23:::1;38::38:24:0;:12::31;:35::47;;:12:::1;16:2:40:3;;45::61::0;;;;;48:21:48:32;;:34::42;;:12::43:1;:4::45;51:23:51:24:0;:12::39;:43::56;;:12:::1;:4::58;52:23:52:24:0;:12::41;:55::56;:45::73;:12:::1;:4::75;53:23:53:24:0;:12::39;:53::54;:43::69;:12:::1;:4::71;55:23:55:24:0;:12::39;:43::51;;:12:::1;:4::53;56:22:56:23:0;:12::38;:42::50;;:12:::1;:4::52;59:12:59:29:0;:33::34;:12:::1;45:2:61:3;3:0:62:1",
    "logs": [],
    "requireMessages": []
  },
  "compiler": {
    "name": "cashc",
    "version": "0.10.0-next.2"
  },
  "updatedAt": "2024-02-26T17:26:33.058Z"
}