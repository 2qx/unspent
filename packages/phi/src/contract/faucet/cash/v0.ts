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
  "bytecode": "OP_CHECKSEQUENCEVERIFY OP_DROP OP_SWAP OP_0 OP_GREATERTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTBYTECODE a914 OP_ACTIVEBYTECODE OP_HASH160 OP_CAT 87 OP_CAT OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_SWAP OP_SUB OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL",
  "source": "pragma cashscript >= 0.7.0;\n\n// v20220609\n\n// This is an experimental faucet contract \n// see bitcoin-cash-faucet\ncontract Faucet(\n\n    // interval for payouts, in blocks\n    int period,\n\n    // amount to be paid by faucet allowance. \n    int payout,\n\n    // random number input into contract to have more than one\n    int index\n) {\n    function drip() {\n\n        // Check that time has passed and that time locks are enabled\n        require(tx.age >= period);\n            \n        // use the index\n        require(index >= 0);\n\n        // require the first output to match the active bytecode\n        require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));\n\n        // Get the total value on the contract\n        int currentValue = tx.inputs[this.activeInputIndex].value;\n\n        // Calculate value returned to the contract\n        int returnedValue = currentValue - payout;\n\n        // Check that the outputs send the correct amounts\n        require(tx.outputs[0].value >= returnedValue);\n    }\n\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.7.2"
  },
  "updatedAt": "2023-03-07T14:05:05.712Z"
}