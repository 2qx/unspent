// Automatically Generated
export const artifact = {
  "contractName": "Coupon",
  "constructorInputs": [
    {
      "name": "destinationLockingBytecode",
      "type": "bytes"
    }
  ],
  "abi": [
    {
      "name": "apply",
      "inputs": []
    }
  ],
  "bytecode": "OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_TXOUTPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_0 OP_UTXOVALUE dc05 OP_SUB OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL OP_VERIFY OP_0 OP_OUTPUTBYTECODE OP_EQUAL",
  "source": "pragma cashscript ^0.10.0;\n\n// Restrict output of any utxo to a preconfigured address\n\ncontract Coupon(\n  // Locking bytecode the coupon will be applied to\n  bytes destinationLockingBytecode\n){\n  function apply() {\n    // Require all utxos be spent atomically\n    require(tx.inputs.length == 1);\n    require(tx.outputs.length == 1);\n\n    // assure at the entire amount minus a transaction fee\n    // goes to the intended output \n    int appliedAmount = tx.inputs[0].value - 1500;\n    require(tx.outputs[0].value >= appliedAmount);\n\n    // Check that the first output \n    // sends to the intended recipient. \n    require(\n      tx.outputs[0].lockingBytecode \n      == destinationLockingBytecode\n    );\n  }\n}",
  "debug": {
    "bytecode": "c3519c69c4519c6900c602dc059400cc517aa26900cd517a87",
    "sourceMap": "11:12:11:28;:32::33;:12:::1;:4::35;12:12:12:29:0;:33::34;:12:::1;:4::36;16:34:16:35:0;:24::42;:45::49;:24:::1;17:23:17:24:0;:12::31;:35::48;;:12:::1;:4::50;22:17:22:18:0;:6::35;23:9:23;;22:6:::1",
    "logs": [],
    "requireMessages": []
  },
  "compiler": {
    "name": "cashc",
    "version": "0.10.0-next.2"
  },
  "updatedAt": "2024-02-26T17:26:33.017Z"
}