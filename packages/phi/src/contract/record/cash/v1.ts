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
  "bytecode": "OP_SWAP OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTBYTECODE OP_HASH160 OP_ROT OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_0 OP_NUMEQUALVERIFY a200 OP_0 OP_OUTPUTBYTECODE OP_SIZE OP_NIP OP_ADD OP_DUP OP_ROT OP_LESSTHANOREQUAL OP_VERIFY OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
  "source": "pragma cashscript ^0.7.0;\n\n/* Publishes a utxfi record under the protocol 0x62616e6b\n */\n\n \ncontract Record(int maxFee, int index) {\n    function execute(bytes20 dataHash) {\n\n        // this does nothing\n        // different indicies denote different contract addresses\n        require(index >= 0);\n\n        // Check that the first tx output is a zero value opcode matching the provided hash\n        require(hash160(tx.outputs[0].lockingBytecode) == dataHash);\n        require(tx.outputs[0].value == 0);\n        \n        // calculate the fee required to propagate the transaction 1 sat/ byte\n        int baseFee = 162;\n        int fee = baseFee + tx.outputs[0].lockingBytecode.length;\n        require(fee<=maxFee);\n\n        // Check that the second tx output sends the change back\n        int newValue = tx.inputs[this.activeInputIndex].value - fee;\n        require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);\n        require(tx.outputs[1].value >= newValue);                \n    }\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.7.2"
  },
  "updatedAt": "2022-08-23T15:30:37.870Z"
}