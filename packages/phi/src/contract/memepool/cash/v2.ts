// Automatically Generated
export const artifact = {
  "contractName": "MemePool",
  "constructorInputs": [
    {
      "name": "houseLockingBytecode",
      "type": "bytes"
    },
    {
      "name": "time",
      "type": "int"
    },
    {
      "name": "increment",
      "type": "int"
    }
  ],
  "abi": [
    {
      "name": "bid",
      "inputs": []
    },
    {
      "name": "hammer",
      "inputs": []
    }
  ],
  "bytecode": "OP_3 OP_PICK OP_0 OP_NUMEQUAL OP_IF aa20 OP_ACTIVEBYTECODE OP_HASH256 OP_CAT 87 OP_CAT OP_0 OP_UTXOBYTECODE OP_OVER OP_EQUALVERIFY OP_0 OP_OUTPUTBYTECODE OP_EQUALVERIFY OP_TXOUTPUTCOUNT OP_2 OP_NUMEQUALVERIFY OP_0 OP_UTXOTOKENCOMMITMENT 20 OP_SPLIT OP_DROP OP_0 OP_UTXOTOKENCOMMITMENT 20 OP_SPLIT OP_NIP OP_BIN2NUM OP_DUP OP_1 OP_6 OP_ROLL 64 OP_DIV OP_ADD OP_MUL OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL OP_VERIFY OP_1 OP_UTXOBYTECODE OP_0 OP_OUTPUTVALUE OP_CAT OP_0 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_1 OP_UTXOBYTECODE OP_2 OP_PICK OP_EQUAL OP_NOT OP_VERIFY OP_1 OP_UTXOBYTECODE OP_1 OP_OUTPUTBYTECODE OP_EQUAL OP_NOT OP_VERIFY OP_1 OP_OUTPUTBYTECODE OP_ROT OP_EQUALVERIFY OP_1 OP_OUTPUTVALUE OP_LESSTHANOREQUAL OP_NIP OP_NIP OP_NIP OP_ELSE OP_3 OP_ROLL OP_1 OP_NUMEQUALVERIFY OP_SWAP OP_CHECKSEQUENCEVERIFY OP_DROP OP_0 OP_UTXOTOKENCOMMITMENT 20 OP_SPLIT OP_DROP OP_0 OP_UTXOTOKENCOMMITMENT 20 OP_SPLIT OP_NIP OP_BIN2NUM OP_0 OP_OUTPUTBYTECODE OP_3 OP_ROLL OP_EQUALVERIFY OP_0 OP_OUTPUTVALUE OP_LESSTHANOREQUAL OP_VERIFY OP_1 OP_OUTPUTBYTECODE OP_OVER OP_EQUALVERIFY OP_1 OP_OUTPUTTOKENCOMMITMENT OP_EQUALVERIFY OP_TXOUTPUTCOUNT OP_2 OP_NUMEQUAL OP_NIP OP_ENDIF",
  "source": "pragma cashscript ^0.8.0;\n\n// Rolling auction for an nft receipt, \n//\n// new bidder refunds losing bidder,\n// ends at some indeterminate future time,\n// ... when all the losers have run out of money.\n//\ncontract MemePool(\n\n    // Address recieving proceeds\n    bytes houseLockingBytecode,\n\n    // Age of utxos required to end auction\n    int time,\n\n    // The next increment in points (%), each new bid must exceed\n    //  5 points =  5% increase, \n    // 10 points = 10% increases, etc.\n    int increment,\n) {\n    function bid() {\n\n        // Using introspection, assure\n        // bid amount increased by an value greater than increment,\n        // the losing bidder recieves a full refund,\n        // sets the new high bidder and bid value in NFT commitment as follows:\n        // \n        // NFT: bidderLockingBytecode (32 bytes) : bidValue (8 bytes)\n        //\n        // Transaction:\n        // [inputs]   [outputs]\n        // auction -> auction [NFT]\n        // new bid -> previous bidder (refund)\n        // ... (s) // multiple input utxos allowed\n        //         // only two outputs (house, loser) allowed\n        //\n        // Some dust or fee allowance may be provided by \n        // the bidders wallet to efficate the transaction.\n        // The \"committed\" bid is less than the value on the contract.\n        // If there is suffecent dust exists on the contract, a bidder may omit it.\n\n        // Require that the nft commitment go back to the auction contract\n\n        // get the auction lockingBytescode\n        bytes auctionLock = new LockingBytecodeP2SH32(hash256(this.activeBytecode));\n\n        // The first input and output of a bid is always the auction contract\n        require(tx.inputs[0].lockingBytecode == auctionLock);\n        require(tx.outputs[0].lockingBytecode == auctionLock);\n\n        // require no more than two outputs        \n        require(tx.outputs.length == 2);\n\n        bytes prevBidderLockinbBytecode = tx.inputs[0].nftCommitment.split(32)[0];\n        int prevBidValue = int(tx.inputs[0].nftCommitment.split(32)[1]);\n\n        // The commitment changes to the bidders bytecode\n        int bidValue = prevBidValue * (1 + increment/100);\n        require(tx.outputs[0].value >= bidValue);\n\n        // match the commitment value to the actual bid, \n        //   not the value calculated in script\n        bytes newCommitment = tx.inputs[1].lockingBytecode+bytes(tx.outputs[0].value);\n        require(tx.outputs[0].nftCommitment == newCommitment);\n\n        // Disable blatant self-bidding ...\n        // using the previous NFT commitment\n        require(tx.inputs[1].lockingBytecode != prevBidderLockinbBytecode);\n        // using introspection\n        require(tx.inputs[1].lockingBytecode != tx.outputs[1].lockingBytecode);\n\n        // Check that the second output sends to the loser\n        require(tx.outputs[1].lockingBytecode == prevBidderLockinbBytecode);\n        require(tx.outputs[1].value >= prevBidValue);      \n    }\n\n    // Anyone can hammer, after the alloted time has expired.\n    //\n    // Assure, using introspection, the winner receives the NFT receipt,\n    // the house receives a utxo equal to or greater than the winning bid.\n    //\n    // The inputs must have aged sufficently to execute.\n    //\n    function hammer(){\n\n        // require time to have elapsed\n        require(tx.age >= time);\n\n        // get the winning bidder and bid\n        bytes winnerLockinbBytecode = tx.inputs[0].nftCommitment.split(32)[0];\n        int winningBid = int(tx.inputs[0].nftCommitment.split(32)[1]);\n\n        // send the proceeds to the house\n        require(tx.outputs[0].lockingBytecode == houseLockingBytecode);\n        require(tx.outputs[0].value >= winningBid);\n\n        // send the receipt to the winner\n        require(tx.outputs[1].lockingBytecode == winnerLockinbBytecode);\n        require(tx.outputs[1].nftCommitment == winnerLockinbBytecode);\n\n        // require no more than two outputs        \n        require(tx.outputs.length == 2);\n    }\n\n    // \n    // function open();\n    // [no op]\n    // \n    // The auction is opened by receiving ONE utxo greater than (or equal to) the opening bid\n    //   and a mutable NFT commitment encoded with the house lockingBytecode and opening bid value \n\n}",
  "compiler": {
    "name": "cashc",
    "version": "0.8.0-next.2"
  },
  "updatedAt": "2023-05-20T22:19:54.091Z"
}