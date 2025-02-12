// Automatically Generated
export const artifact = {
  "contractName": "Perpetuity",
  "constructorInputs": [
    {
      "name": "recipientLockingBytecode",
      "type": "bytes"
    }
  ],
  "abi": [
    {
      "name": "execute",
      "inputs": []
    }
  ],
  "bytecode": "OP_TXVERSION OP_2 OP_NUMEQUALVERIFY 1f11 OP_CHECKSEQUENCEVERIFY OP_DROP OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE 64 OP_DIV OP_GREATERTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE 2b1b0f OP_MUL 40420f OP_DIV OP_GREATERTHANOREQUAL",
  "source": "pragma cashscript ^0.10.0;\n\n// Unspent Phi\n//\n// Perpetuity v3 \n//\n// Perpetuity: fractional monthly payments using rolling timelocks.\n// \n// String & op_return serializations:\n//\n// P,3,<receiptLockingBytecode>,<contractBytecode>\n// \n// 6a 047574786f\n// 01 50\n// 01 03\n// ...\n//\n\ncontract Perpetuity(\n\n // lockingBytecode of the beneficiary, \n // the address receiving payments\n bytes recipientLockingBytecode,\n\n) {\n function execute() {\n\n  // [ ] Force tx version equal to 2 to force BIP68 support\n  // OP_TXVERSION OP_2 OP_NUMEQUALVERIFY \n  require(tx.version == 2);\n  \n  // [ ] Check that time has passed and that time locks are enabled\n  // 1f11 OP_CHECKSEQUENCEVERIFY OP_DROP \n  require(tx.age >= 4383);\n\n  // [ ] Limit to a single utxo input\n  // OP_TXINPUTCOUNT OP_1 OP_NUMEQUALVERIFY \n  require(tx.inputs.length == 1);\n\n  // [ ] Check that the first output sends to the recipient\n  // OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY \n  require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);\n\n  // [ ] Check that the output sends a normal installment\n  // OP_0 OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE 64 OP_DIV OP_GREATERTHANOREQUAL OP_VERIFY \n  require(tx.outputs[0].value >= tx.inputs[this.activeInputIndex].value/100);\n\n  // [ ] require the second output match the active bytecode\n  // OP_1 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY \n  require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);\n\n  // [ ] balance was returned to the contract, minus 5/1,000,000 for executor fee\n  // OP_1 OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE 2b1b0f OP_MUL 40420f OP_DIV OP_GREATERTHANOREQUAL\n  require(tx.outputs[1].value >= tx.inputs[this.activeInputIndex].value*989995/1000000);\n  \n }\n}\n",
  "debug": {
    "bytecode": "c2529c69021f11b275c3519c6900cd517a876900ccc0c6016496a26951cdc0c7876951ccc0c6032b1b0f950340420f96a2",
    "sourceMap": "30:10:30:20;:24::25;:10:::1;:2::27;34:20:34:24:0;:2::26:1;;38:10:38::0;:30::31;:10:::1;:2::33;42:21:42:22:0;:10::39;:43::67;;:10:::1;:2::69;46:21:46:22:0;:10::29;:43::64;:33::71;:72::75;:33:::1;:10;:2::77;50:21:50:22:0;:10::39;:53::74;:43::91;:10:::1;:2::93;54:21:54:22:0;:10::29;:43::64;:33::71;:72::78;:33:::1;:79::86:0;:33:::1;:10",
    "logs": [],
    "requireMessages": []
  },
  "compiler": {
    "name": "cashc",
    "version": "0.10.0-next.2"
  },
  "updatedAt": "2025-02-11T22:35:58.363Z"
}