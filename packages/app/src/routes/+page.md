# Welcome!

Unspent Phi (₿∙ϕ) is an app for creating (and publishing) a set of simple contracts on the Bitcoin Cash (BCH) blockchain that anyone can execute. These contracts lock the value of unspent outputs from earlier transactions (UTXOs), and allow some small reward for any party to call a known contract (if valid according to the rules of BitcoinScript). Although simple, these contracts may be chained together to create complex outcomes.

₿∙ϕ contracts may be thought of as automata, machines that are unlocked and stepped forward by random participants on the blockchain. No one party has control, it's a race to spend them first. However, the code to unlock them must be known for the code to stepped forward. Money sent to ₿∙ϕ contracts appear identical to any other pay-to-script UTXOs on the network. Nothing is known about how to spend the contract until it is spent at least once, so in order for the contract to function automatically, both their existence and the parameters to unlock them must be known. While the code to unlock is broadcasted by spending the contract once, not all contracts can be spent right away, so it's easier and safer just to publish some unlock record and not worry about forgetting how to unlock them.

- [Welcome!](#welcome)
- [Definitions](#definitions)
- [Contract Types](#contract-types)
  - [Beneficiary Contracts](#beneficiary-contracts)
  - ["Free" contracts](#free-contracts)
  - [Timelock v non-timelocked](#timelock-v-non-timelocked)
- [Implemented Contracts](#implemented-contracts)
  - [Annuity](#annuity)
  - [Divide](#divide)
  - [Faucet](#faucet)

# Definitions

**covenant**: A contract with variable parameters stored in script, which change.

**satoshis**: A unit of account (on the Bitcoin Cash fork of the initial bitcoin blockchain). A hundred million satoshi are equal to 1 Bitcoin Cash.

**blocks (timescale)**: The base unit of time on bitcoin, about 10 minutes on average. 

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

**OP_RETURN**: A code (106) in BitcoinScript for transaction outputs which can store arbitrary data.

**OP_RETURN data**: Data in OP_RETURNs is commonly encoded by pushing the total number of bytes, followed by the data bytes. For example `04` followed by `7574786f` (4 bytes of in two letter hex). This format is used to "broadcast" ₿∙ϕ contracts. 

**published**: In the context of an unspent contract, a contract is published if the parameters to construct and spend it are recorded on the blockchain, either in an OP_RETURN or by reference to the spent output.

**Unspent Transaction Output (UTXO)**: some value, defined by the output of a previous transaction, which is locked by some code, either the hash of a public key (cashaddr), or a script. 


# Contract Types

Each ₿∙ϕ contract is designed to do one thing. The contracts available (so far) are as follows:

## Beneficiary Contracts

Some contracts control value on behalf of the contract creator. They all have an executor allowance which can be claimed by the party which submits a valid spending transactions.

| Name       | Description                                            |
| ---------- | ------------------------------------------------------ |
| Annuity    | Equal payments over time.                              |
| Divide     | Divide money into equal payments, up to four addresses |
| Perpetuity | Pay a fixed fraction of total value at intervals       |

## "Free" contracts

Contracts with locked value that can be spent by anyone can be characterized as "free". At present these include faucets, mining covenants, and a contract providing the facility to record data for free.

| Name   | Description                                            |
| ------ | ------------------------------------------------------ |
| Faucet | Distributes some free bitcoin per period               |
| Mine   | Distributes some bitcoin per period, for proof of work |
| Record | Broadcast a contract to the blockchain                 |

## Timelock v non-timelocked

The Divide and Record contracts are not timelocked, they may be called at anytime. 

# Implemented Contracts

## Annuity

The annuity contract pays a fixed amount (in satoshis) to a predefined locking bytecode (i.e. address). 

To prevent the contract from being called successively (thus paying out all at once), a timelock is added restricting input be of a certain age (in blocks), this parameter is called the `period`. The beneficiary address (or contract) is denoted by the `recipientLockingBytecode`. The amount paid in each period is the `installment`. To aid in execution, a small fee is left as `executorAllowance` for each execution of the contract, it may be paid to anyone.

This contract: checks that the first output pays to the beneficiary; checks that the timelock is satisfied; checks that the second output pays back to the contract; gets the total value being spent; calculates the amount to be returned, and finally, checks that both the installment amount of the first output & the total returned to the contract exceed the required amounts.


```solidity
pragma cashscript >= 0.7.1;


// Pay equal payments at regular intervals using input locks
contract Annuity(

    // interval for payouts, in blocks
    int period,

    // LockingBytecode of the beneficiary, the address receiving payments
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

      // for each beneficiary, take the LockingBytecode as input
      bytes r0LockingBytecode,
      bytes r1LockingBytecode
  ) {
      function execute() {

        // distributes to each output in order
        require(tx.outputs[0].lockingBytecode == r0LockingBytecode);
        require(tx.outputs[1].lockingBytecode == r1LockingBytecode);

        // Get the total value of inputs
        int currentValue = tx.inputs[this.activeInputIndex].value;

        // Total value paid to beneficiaries, minus executor allowance
        int distributedValue = currentValue - executorAllowance;

        // Value paid to each beneficiary
        int distribution = distributedValue / divisor;

        // each output must be greater or equal to the distribution amount
        require(tx.outputs[0].value >= distribution);
        require(tx.outputs[1].value >= distribution);
      }
  }
```

## Faucet

The faucet contract pays "free" bitcoin.

To prevent the faucet from being drained by successive calls, a `period` timeout is set to specify the minimum age of the input being spent. The amount available to be spent is defined by a `payout`.  As a convenience, and to have multiple faucets with the same payout, an `index` parameter is added to distinguish identical contracts.

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
        //  then assert that the value must return to the contract
        if(currentValue > payout){
           require(tx.outputs[0].value >= returnedValue);
        }

    }

}
```