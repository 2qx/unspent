---
layout: splash
---

<svelte:head>

<title>Unspent Phi</title>
</svelte:head>

# Welcome!

Unspent Phi (₿∙ϕ) is an app for creating (and publishing) a set of simple contracts on the Bitcoin Cash (BCH) blockchain that anyone can execute. These contracts lock the value of unspent outputs from earlier transactions (UTXOs), and allow some small reward for any party to call a known contract (if valid according to the rules of BitcoinScript). Although simple, these contracts may be chained together to create complex outcomes.

₿∙ϕ contracts may be thought of as automata, machines that are unlocked and stepped forward by random participants on the blockchain. No one party has control, it's a race to spend them first. However, the code to unlock them must be known for the code to stepped forward. Money sent to ₿∙ϕ contracts appear identical to any other pay-to-script UTXOs on the network. Nothing is known about how to spend the contract until it is spent at least once, so in order for the contract to function automatically, both their existence and the parameters to unlock them must be known. While the code to unlock is broadcasted by spending the contract once, not all contracts can be spent right away, so it's easier and safer just to publish some unlock record and not worry about forgetting how to unlock them.

# Contract Types

Each ₿∙ϕ contract is designed to do one thing. The contracts available (so far) are as follows:

## Beneficiary Contracts

Some contracts control value on behalf of the contract creator. They all have an executor allowance which can be claimed by the party which submits a valid spending transactions.

| Name       | Description                                            |
| ---------- | ------------------------------------------------------ |
| Annuity    | Equal payments over time.                              |
| Divide     | Divide money into equal payments, up to four addresses |
| Perpetuity | Pay a fixed fraction of total value at intervals       |

## Distributive Contracts

Contracts with locked value that can be spent by anyone can be characterized as "free". At present these include faucets, mining contracts.

| Name   | Description                                            |
| ------ | ------------------------------------------------------ |
| Faucet | Distributes some free bitcoin per period               |
| Mine   | Distributes some bitcoin per period, for proof of work |

## Informational Contracts

A contract providing the facility to record data for free.

| Name   | Description                            |
| ------ | -------------------------------------- |
| Record | Broadcast a contract to the blockchain |

## Timelock v non-timelocked

Contracts in BitcoinScript may be locked using [BIP68](https://reference.cash/protocol/forks/bip-0068)

The Divide and Record contracts are not time-locked, they may be called at anytime.

# Contracts

## Annuity

The annuity contract pays a fixed amount (in satoshis) to a predefined locking bytecode (i.e. address).

To prevent the contract from being called successively (thus paying out all at once), a timelock is added restricting input be of a certain age (in blocks), this parameter is called the `period`. The beneficiary address (or contract) is denoted by the `recipientLockingBytecode`. The amount paid in each period is the `installment`. To aid in execution, a small fee is left as `executorAllowance` for each execution of the contract, it may be paid to anyone.

This contract: checks that the first output pays to the beneficiary; checks that the timelock is satisfied; checks that the second output pays back to the contract; gets the total value being spent; calculates the amount to be returned, and finally, checks that both the installment amount of the first output & the total returned to the contract exceed the required amounts.

```solidity
pragma cashscript >= 0.7.1;

// v202205626

// Pay equal payments at regular intervals using input locks
contract Annuity(

  // interval for payouts, in blocks
  int period,

  // LockingBytecode of the beneficiary,
  // the address receiving payments
  bytes recipientLockingBytecode,

  // amount paid in each installment
  int installment,

  // extra allowance for administration of contract
  // fees are paid from executors' allowance.
  int executorAllowance
) {
  function execute() {

    // Check that the first output sends to the recipient
    require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);

    // Check that time has passed and that time locks are enabled
    require(tx.age >= period);

    // require the second output to match the active bytecode
    require(tx.outputs[1].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));

    // Get the total value on the contract
    int currentValue = tx.inputs[this.activeInputIndex].value;

    // Calculate value returned to the contract
    int returnedValue = currentValue - installment - executorAllowance;

    // Check that the outputs send the correct amounts
    require(tx.outputs[0].value >= installment);
    require(tx.outputs[1].value >= returnedValue);
  }
}
```

## Divide

The divide contract splits inputs across a predefined set of output destinations.

Each output is denoted by `r#LockingBytecode`, where `#` is the index of the output. Since early BitcoinScript did not have loops, this contract was written with a static list of outputs and a `divisor`, which is simply the number of outputs. An `executorAllowance` amount is subtracted from the total distribution amount, which may be spent by anyone as long as the amount payed to the hardcoded receipts equals or exceeds the alloted share.

This contract: checks that each of the output destinations match the predefined output; calculates the total value on the contract; calculates the amount to be paid to each receipt (`distribution`), and finally calculates that each receipt receives an output greater than, or equal to, the distribution amount.

```solidity
pragma cashscript >= 0.7.0;

 contract Divide(
   // allowance for party executing the contract
   int executorAllowance,
   // number of outputs receiving payout
   int divisor,

   // for each beneficiary,
   // take the LockingBytecode as input
   bytes r0LockingBytecode,
   bytes r1LockingBytecode
 ) {
   function execute() {

    // distributes to each output in order
    require(tx.outputs[0].lockingBytecode == r0LockingBytecode);
    require(tx.outputs[1].lockingBytecode == r1LockingBytecode);

    // Get the total value of inputs
    int currentValue = tx.inputs[this.activeInputIndex].value;

    // Total value paid to beneficiaries,
    // minus executor allowance
    int distributedValue = currentValue - executorAllowance;

    // Value paid to each beneficiary
    int distribution = distributedValue / divisor;

    // each output must be greater
    // or equal to the distribution amount
    require(tx.outputs[0].value >= distribution);
    require(tx.outputs[1].value >= distribution);
   }
 }
```

## Faucet

The faucet contract pays "free" bitcoin.

To prevent the faucet from being drained by successive calls, a `period` timeout is set to specify the minimum age of the input being spent. The amount available to be spent is defined by a `payout`. As a convenience, and to have multiple faucets with the same payout, an `index` parameter is added to distinguish identical contracts.

The steps of this contract are as follows: first, it requires that the transaction be called with an age that is greater than the current `period`; the `index` is used so that it is not unused; next the first output must return all value to the faucet contract, and finally the returned value is calculate and must be returned to the faucet if the current value exceeds the payout.

```solidity
pragma cashscript >= 0.7.0;

// v20220609

contract Faucet(

  // interval for payouts, in blocks
  int period,

  // amount to be paid by faucet allowance.
  int payout,

  // random number input into contract to have more than one
  int index
) {
  function drip() {

    // Check that time has passed and that time locks are enabled
    require(tx.age >= period);

    // use the index
    require(index >= 0);

    // require the first output to match the active bytecode
    require(tx.outputs[0].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));

    // Get the total value on the contract
    int currentValue = tx.inputs[this.activeInputIndex].value;

    // Calculate value returned to the contract
    int returnedValue = currentValue - payout;

    // If the value on the contract exceeds the payout amount
    // then assert that the value must return to the contract
    if(currentValue > payout){
      require(tx.outputs[0].value >= returnedValue);
    }

  }

}
```

## Mine-able Faucet

| ‼️ Mining covenants are temporarily "disabled" in the earn tab |
| -------------------------------------------------------------- |
| But they still out there and will be back in the app soon.     |

The ₿∙ϕ mining covenant is very much like the faucet, with some additional requirements.

First, execution of the contract must be called with a `nonce` [a random value used once]
which when added to the current locking bytecode and hashed results in a value starting with some number of zeros.
How many zeros is the `difficulty`.

Finally, prior to spending the mining `payout`, the spender must announce
the winning `nonce` in an OP_RETURN of the first output, and send the balance of the contract to a new mining covenant with the new nonce as a `canary`.

![Replace the canary](images/canary.jpeg "Look, see, he's alright. He's fine.")
Like an infinite series of Failures to Deliver (FTDs) for a stock, or banging forex futures to manipulate an outcome in currency markets, the canary is always brought back to life with a new copy of itself. You don't have to take over a whole blockchain to create a market for your energy, just mine a covenant—there will be far less idiosyncratic risk.

```solidity
pragma cashscript >= 0.7.1;

// v20220727

// A faucet with proof of work.
contract Mine(

  // interval for payouts, in blocks
  int period,

  // amount to be paid by faucet allowance.
  int payout,

  // how many leading zeros should the hash of the nonce and current bytecode have
  int difficulty,

  // the old nonce, which is replaced each time.
  bytes7 canary
) {
  function execute(bytes7 nonce) {

    // Check that time has passed and that time locks are enabled
    require(tx.age >= period);

    // Use the old nonce
    require(canary.length==7);

    // Check that the new nonce creates a hash with
    // some D (difficulty) leading zeros when hashed with the active bytecode
    bytes version = byte(1);
    bytes zeros = bytes7(0);
    bytes hash = sha256(this.activeBytecode + bytes7(nonce));
    require(hash.split(difficulty)[0] == zeros.split(difficulty)[0]);

    // calculate the locking bytecode
    // of a new mining contract with the nonce as canary
    bytes newContract = 0x7 + bytes7(nonce) + this.activeBytecode.split(8)[1];
    bytes20 contractHash = hash160(newContract);
    bytes23 lockingCode = new LockingBytecodeP2SH(contractHash);


    // Require the first output details the parameters
    // of the mining contract in a zero value OP_RETURN
    bytes announcement = new LockingBytecodeNullData([
      // The protocol
      0x7574786f,
      // M for mining contract
      bytes('M'),
      // version
      bytes(version),
      // The period,
      bytes(period),
      // The payout,
      bytes(payout),
      // preceding zeros on solution
      bytes(difficulty),
      // The current nonce (future canary), of the mining contract,
      // where funds are simultaneously sent to
      bytes(nonce),
      // The new bytecode
      bytes(lockingCode)
    ]);

    // Assure that the first output matches the arguments to the contract
    require(tx.outputs[0].lockingBytecode == announcement);

    // check that the change output sends to that contract
    require(tx.outputs[1].lockingBytecode == lockingCode);

    // Get the total value on the contract
    int currentValue = tx.inputs[this.activeInputIndex].value;

    // Calculate value returned to the contract
    int returnedValue = currentValue - payout;

    // If the value on the contract exceeds the payout amount
    // then assert that the value must return to the contract
    if(currentValue > payout){
    require(tx.outputs[1].value >= returnedValue);
    }

    // Assure it has zero value
    require(tx.outputs[0].value == 0);
  }

}
```

## Perpetuity

The Perpetuity contract works like an Annuity, however rather than pay a fixed amount, a fixed fraction of the total is paid each period.

The fraction paid is determined by the `decay` parameter. If a `decay` of 10 is specified, then one tenth the value is paid each period.

```solidity
pragma cashscript >= 0.7.1;

// v20220522

contract Perpetuity(

 // interval for payouts, in blocks
 int period,

 // lockingBytecode of the beneficiary,
 // the address receiving payments
 bytes recipientLockingBytecode,

 // extra allowance for administration of contract
 // fees are paid from executors' allowance.
 int executorAllowance,

 // divisor for the payout,
 // each payout must be greater than
 // the total amount held on the contract
 // divided by this number
 int decay

) {
 function execute() {

  // Check that the first output sends to the recipient
  require(tx.outputs[0].lockingBytecode == recipientLockingBytecode);

  // Check that time has passed and that time locks are enabled
  require(tx.age >= period);

  // require the second output to match the active bytecode
  require(tx.outputs[1].lockingBytecode == new LockingBytecodeP2SH(hash160(this.activeBytecode)));

  // Get the total value on the contract
  int currentValue = tx.inputs[this.activeInputIndex].value;

  // The payout is the current value divided by the decay
  int installment = currentValue/decay;

  // Calculate value returned to the contract
  int returnedValue = currentValue - installment - executorAllowance;

  // Check that the outputs send the correct amounts
  require(tx.outputs[0].value >= installment);
  require(tx.outputs[1].value >= returnedValue);

 }
}
```

## Record

A utility function to broadcast new contracts as OP_RETURN messages.

```solidity
pragma cashscript ^0.7.0;

/* Allows publishing some OP_RETURN message,
 * given that:
 * 1. the hash160 value of the zero value OP_RETURN message is passed
 * 2. the first output has zero value
 * 3. the remaining value is pass back to the contract, mostly.
 */


contract Record(int maxFee, int index) {
 function execute(bytes20 dataHash) {

  // this does nothing
  // different indices enable different contract addresses
  require(index >= 0);

  // Check that the first tx output is a zero value opcode matching the provided hash
  require(hash160(tx.outputs[0].lockingBytecode) == dataHash);
  require(tx.outputs[0].value == 0);

  // calculate the fee required to propagate the transaction 1 sat/ byte
  int baseFee = 162;

  int fee = baseFee + tx.outputs[0].lockingBytecode.length;
  require(fee<=maxFee);

  // Check that the second tx output sends the change back
  int newValue = tx.inputs[this.activeInputIndex].value - fee;
  require(tx.outputs[1].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode);
  require(tx.outputs[1].value >= newValue);
 }
}
```

# Definitions

## Units

bitcoin has it's own units of value and time. Although there are whole coins and it's possible to use epoch time (seconds since 1970) in some cases, we'll stick to two here to steer clear of the politics surrounding "leap seconds" and what is a _unit of account_.

### satoshis

A unit of account (on the Bitcoin Cash fork of the initial bitcoin blockchain). A hundred million satoshi are equal to 1 Bitcoin Cash.

### blocks (time)

The base unit of time on bitcoin is called a block, blocktimes very, but are about 10 minutes on average.

| Blocks | Minutes | Days  | Years |
| ------ | ------- | ----- | ----- |
| 1      | 10      | -     | -     |
| 10     | 100     | -     | -     |
| 100    | 1000    | 0.694 | -     |
| 144    | 1440    | 1     | -     |
| 1000   | -       | 6.94  | -     |
| 4000   | -       | 27.7  | -     |
| 13140  | -       | 91.25 | 0.249 |
| 26280  | -       | -     | 0.499 |
| 52560  | -       | -     | 0.999 |

The largest value specified by the timelock upgrade [(BIP68)](https://reference.cash/protocol/forks/bip-0068) is a 16-bit value. Contracts with locking periods larger than the maximum value (65536) have **not** been tested, and should not be expected to work.

## Languages

### BitcoinScript

A procedural, stack-oriented programming language (Forth-like) with different rules and operations. In practice, it is [Script](https://reference.cash/protocol/blockchain/script) that mostly unlocks value on a bitcoin network.

### CashScript

[CashScript is a high-level programming language for smart contracts on Bitcoin Cash](https://cashscript.org/docs/basics/about) that transpiles to BitcoinScript.

## Script Components

### Unlocking Script

Code that is run before running the unlocking code. If execution doesn't trigger failures and leaves a single non-zero value, it is considered unlocked.
[More](https://reference.cash/protocol/blockchain/transaction/unlocking-script)

### Locking Script

At present (Nov 2022), there are two types of unlocking script (actually 4). P2PKH (pay-to-publicKeyHash), which pays to the hash of a public key. And Pay to Script (P2PSH) which pay to an unlocking script hash.

[More info](https://reference.cash/protocol/blockchain/transaction/locking-script)

### OP_RETURN

A code (106) in BitcoinScript for transaction outputs which can store arbitrary data.

### OP_RETURN data

Data in OP_RETURNs is commonly encoded by pushing the total number of bytes, followed by the data bytes. For example `04` followed by `7574786f` (4 bytes of in two letter hex). This format is used to "broadcast" ₿∙ϕ contracts.

### Published

In the context of an unspent contract, a contract is published if the parameters to construct and spend it are recorded on the blockchain, either in an OP_RETURN or by reference to the spent output.

A cashaddress locks value, the parameters of the contract allow unlocking the value.

### Unspent Transaction Output (UTXO)

some value, defined by the output of a previous transaction, which is locked by some code, either the hash of a public key (cashaddr), or a script that, when executed, satisfies a locking code.

The value may be zero, in the case of an OP_RETURN.
