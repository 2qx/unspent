// Automatically Generated
export const artifact = {
  "contractName": "DripMine",
  "constructorInputs": [],
  "abi": [
    {
      "name": "drip",
      "inputs": []
    }
  ],
  "bytecode": "OP_1 OP_CHECKSEQUENCEVERIFY OP_DROP OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_TXOUTPUTCOUNT OP_1 OP_NUMEQUALVERIFY 4002 a400 OP_INPUTINDEX OP_UTXOVALUE OP_ROT OP_2 OP_PICK OP_ADD OP_GREATERTHAN OP_IF OP_INPUTINDEX OP_UTXOBYTECODE OP_INPUTINDEX OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE 2811 OP_MUL c685744f OP_DIV OP_2DUP OP_GREATERTHAN OP_IF OP_OVER OP_NIP OP_ENDIF OP_INPUTINDEX OP_UTXOVALUE OP_INPUTINDEX OP_OUTPUTVALUE OP_SUB OP_2DUP OP_GREATERTHANOREQUAL OP_VERIFY OP_2DROP OP_ELSE OP_INPUTINDEX OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY OP_INPUTINDEX OP_OUTPUTBYTECODE 6a OP_EQUALVERIFY OP_ENDIF OP_DROP OP_1",
  "source": "// Drip Mine: An MEV faucet\n// Contributed by Bitcoin Cash Autist - 2025\n// https://gitlab.com/0353F40E/drip-mine\n// \ncontract DripMine() {\n\n    function drip() {\n        // Drip once per block\n        // OP_1 OP_CHECKSEQUENCEVERIFY OP_DROP\n        require(tx.age >= 1);\n\n        // Drip will be released as TX fee\n        // OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY\n        // OP_TXOUTPUTCOUNT OP_1 OP_NUMEQUALVERIFY\n        require(tx.inputs.length == 1);\n        require(tx.outputs.length == 1);\n\n        // dustLimit = 444 + output_size * 3; // p2sh32 output size is 44\n        // 4002 \n        int dustLimit = 576;\n\n        // minPayout = this_tx_size * min_fee_rate; \n        // this TX size will be 164, double check when compiling\n        // a400\n        int minPayout = 164;\n\n        // if we have enough to pay out the minimum and stay above dust limit\n        // then we drip from the contract\n        // OP_INPUTINDEX OP_UTXOVALUE OP_ROT OP_2 OP_PICK OP_ADD OP_GREATERTHAN OP_IF\n        if (tx.inputs[this.activeInputIndex].value > dustLimit + minPayout) {\n\n            // DripMine contract must be passed on\n            // OP_INPUTINDEX OP_UTXOBYTECODE OP_INPUTINDEX OP_OUTPUTBYTECODE OP_EQUALVERIFY\n            require(tx.inputs[this.activeInputIndex].lockingBytecode ==\n                    tx.outputs[this.activeInputIndex].lockingBytecode);\n\n            // Calculate maxPayout\n            // Decay half-life of 4 years\n            // OP_INPUTINDEX OP_UTXOVALUE 2811 OP_MUL c685744f OP_DIV\n            int maxPayout = (tx.inputs[this.activeInputIndex].value * 4392) / 1333036486;\n\n            // If calculated payout would be too low, switch to flat minPayout\n            // OP_2DUP OP_GREATERTHAN OP_IF\n            if (maxPayout < minPayout) {\n                // OP_OVER OP_NIP\n                maxPayout = minPayout;\n            } // OP_ENDIF\n\n            // TX fee is the payout to miners\n            // OP_INPUTINDEX OP_UTXOVALUE OP_INPUTINDEX OP_OUTPUTVALUE OP_SUB\n            int payout = tx.inputs[this.activeInputIndex].value -\n                         tx.outputs[this.activeInputIndex].value;\n            // OP_2DUP OP_GREATERTHANOREQUAL OP_VERIFY\n            require(payout <= maxPayout);\n\n        // else we sweep everything as fee and terminate the contract\n        // OP_2DROP OP_ELSE\n        } else {\n            // Burn the output with remainning value to miners' fees\n            // OP_INPUTINDEX OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY\n            require(tx.outputs[this.activeInputIndex].value == 0);\n            // OP_INPUTINDEX OP_OUTPUTBYTECODE 6a OP_EQUALVERIFY\n            require(tx.outputs[this.activeInputIndex].lockingBytecode == 0x6a);\n        } //OP_ENDIF \n    } // OP_DROP OP_1\n}\n",
  "debug": {
    "bytecode": "51b275c3519c69c4519c6902400202a400c0c6527a527993a063c0c7c0cd8769c0c60228119504c685744f96007952799f635179517a7568c0c6c0cc9400795279a169757567c0cc009c69c0cd016a8769685177",
    "sourceMap": "10:26:10:27;:8::29:1;;15:16:15:32:0;:36::37;:16:::1;:8::39;16:16:16:33:0;:37::38;:16:::1;:8::40;20:24:20:27:0;25::25;30:22:30:43;:12::50:1;:53::62:0;;:65::74;;:53:::1;:12;:76:58:9:0;34:30:34:51;:20::68:1;35:31:35:52:0;:20::69:1;34;:12::71;40:39:40:60:0;:29::67:1;:70::74:0;:29:::1;:78::88:0;:28:::1;44:16:44:25:0;;:28::37;;:16:::1;:39:47:13:0;46:28:46:37;;:16::38:1;;;44:39:47:13;51:35:51:56:0;:25::63:1;52:36:52:57:0;:25::64:1;51;54:20:54:26:0;;:30::39;;:20:::1;:12::41;30:76:58:9;;58:15:64::0;61:31:61:52;:20::59:1;:63::64:0;:20:::1;:12::66;63:31:63:52:0;:20::69:1;:73::77:0;:20:::1;:12::79;58:15:64:9;7:4:65:5;",
    "logs": [],
    "requires": [
      {
        "ip": 1,
        "line": 10
      },
      {
        "ip": 6,
        "line": 15
      },
      {
        "ip": 10,
        "line": 16
      },
      {
        "ip": 27,
        "line": 34
      },
      {
        "ip": 56,
        "line": 54
      },
      {
        "ip": 64,
        "line": 61
      },
      {
        "ip": 69,
        "line": 63
      }
    ]
  },
  "compiler": {
    "name": "cashc",
    "version": "0.10.5"
  },
  "updatedAt": "2025-02-11T15:41:24.212Z"
}