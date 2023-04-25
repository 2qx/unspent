// Automatically Generated
export const artifact = {
  "contractName": "Gate",
  "constructorInputs": [
    {
      "name": "threshold",
      "type": "int"
    },
    {
      "name": "recipientLockingBytecode",
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
    }
  ],
  "bytecode": "OP_0 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_INPUTINDEX OP_UTXOVALUE OP_0 OP_OUTPUTVALUE OP_3 OP_ROLL OP_ROT OP_2 OP_PICK OP_SUB OP_GREATERTHANOREQUAL OP_VERIFY OP_LESSTHANOREQUAL",
  "source": "pragma cashscript >= 0.7.1;\n\n// v20221205\n\n// A dust Gate collects very small inputs (i.e. dust)\n// until a certain threshold usable value is reached, \n// then allows that value to be paid to a pre-determined address.\n// \n// It may be useful for collecting very small inputs, \n// it SHOULD NOT be integrated into any larger payment flow \n// requiring inputs much larger than 10-40x the current dust limit, \n// nor for collecting payments over a long period of time.\n//\n// Further, if the contract is intended to collect a lot of small payments,\n// the executor allowance must accomidate a large contract.\n// \n// All software permitting use of this contract should take these hazards \n// into consideration and MUST prevent users from bricking funds \n// in a Gate with a ridiculous threshold, or executor allowance so small that \n// inputs cannot be easily spent.\n//\n\n\n\ncontract Gate(\n\n  // threshold for output transactions\n  int threshold,\n\n  // LockingBytecode of the beneficiary, the address receiving payments\n  bytes recipientLockingBytecode,\n\n  // extra allowance for administration of contract\n  // fees are paid from executors' allowance. \n  int executorAllowance\n) {\n  function execute() {\n\n    // Check that the first output sends to the recipient\n    require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n        \n    // Get the value input to the transaction\n    int inputValue = tx.inputs[this.activeInputIndex].value;\n\n    // get the vaule paid to the recipient\n    int recipientValue = tx.outputs[0].value;  \n\n    // assure total input minus recipient dispersement is less than executor allowance\n    require(executorAllowance >= inputValue - recipientValue);\n\n    // require the value paid (minus fees) exceeds the threshold.\n    require(recipientValue >= threshold);\n        \n    // let the executor do as they please with tx.outputs[n+]\n  }\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.7.2"
  },
  "updatedAt": "2023-04-13T16:47:20.332Z"
}