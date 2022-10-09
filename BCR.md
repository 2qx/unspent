<div data-theme-toc="true"> </div>


# Introduction

BitcoinScript and the Bitcoin VM enables a powerful set of stack-based logic to control how (or when) value is spent. In addition, higher-level scripting languages (CashScript & spedn) lower the technical bar for writing contracts that transpile to BitcoinScript.  However, the reach of this technology remains relatively limited to a small set of blockchain application developers in the UTXO space, and while it makes sense to develop a complex contract (or set of contracts) for a large application or service (Anyhedge/Jedex), there is a large swath of bespoke financial transactions people typically conduct with a single trusted party (themselves, people they give money to), with zero or very limited & arguments at the time of execution.

Some of this core-traditional market demand is addressed by Electron-cash plugins. (Such as the [Last Will Plugin](https://github.com/KarolTrzeszczkowski/Electron-Cash-Last-Will-Plugin) by @Licho , or the [Hodl Plugin](https://github.com/mainnet-pat/hodl_ec_plugin) by Pat.)

However, this approach leads to a number of UX challenges:

* To create or claim the script, users must install both electron-cash and the plugin.
* The relevant user(s) must remember the contract existence and execute the unlocking script.
* In addition to seed phrases, the plugin must store, or derive, the data necessary to unlock the contract, or this data must be transmitted to the receiving parties.

In addition to these issues for simple cases, the actual way people "hard-code" the spending of value with soft-finance contracts and wills is usually a bit more complex than simply hodling, or willing everything to one heir. 

Entities often divide value in shares or lays. Parents want to divide in equal fractions. People want equal payments over time. Or, they want to gift money in powerful ways far into the future. 

People want to "mine" bitcoin in the browser, and someone will always want free bitcoin for doing little or nothing. 

So rather than create a dozen plugins, or large bespoke contracts for everyone, perhaps there's a better way, today...

# Re: Introspection; Hello, Automata!

Since the introduction of introspection, unlocking script has access to both total value and individual input/output values in BitcoinScript. So some of the previous pain points can be resolved by:

* Publishing the parameters of a "well known" script
* Accounting for a small fee available to the party (anybody) that executes the script.

The idea being, if the ability to create the unlocking script is well known and incentivized, an economy can develop for the execution of a set of scripts by anyone, for a fee. 

* Users receiving funds may not actually have to call the script.
* Users can publish the unlocking script, and someone may want to execute it.
* Since some scripts may not require access to private keys, the security requirements for the user are greatly reduced, as most of the risk is off-loaded to the contract. Which is to say, it may be appropriate to use in a sketchy context, like a web-browser. 

In the example of a time lock script, if a time locking script were written to leave some small fee (say 1500 sats) as extra output, then someone could call that script to claim the fee. The funding transaction, or any transaction, could publish the serialized parameters referring to the script in an OP_RETURN, and some party could be paid to track and execute it in a timely manner. Failing that, the original user would have a record (on-chain) and could call the contract over a web page, service or cli, without installing desktop software or plugins (because it doesn't need keys).

With these simple contracts, more complex functionality could be emulated by chaining the output of contracts into others. In the case of a Will contract, it's quite possible that someone has more than one heir. It also isn't always appropriate to give people of a certain age an entire inheritance, or to give an inheritance all at once. 

# A simpler example: just divide input(s) in half*

For a concrete example of an anyone-can-spend contract, suppose we implement the above contract to divide any input across two addresses, mostly equally. 

First, lets account for both the mining fee and the executor fee with an `executorAllowance`. This is the total amount outputs are reduced by, and it is presumed that the executor has accounted for the required miner fees out of their own end. Without loops, it's expedient to have the `divisor` hardcoded as input to the contract. The function `execute()` takes no inputs and simply assures the receipts are correct, and the amounts exceed half the initial total, minus the `executorAllowance`. 

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
      function execute() {  // no args!

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

So the trick here is that outputs beyond the first two are unrestricted. So anyone who submitted a transaction could claim the 1200 sats, minus the miner fee. An executor could call the CashScript function above and pay themselves by tacking on their address and desired payment to the third output, like so:

```javascript
    // ... instantiate the CashScript contract, from artifact, parameters, provider, 
    // ... estimate fee, calculate installment, etc. 
    // ...
    let fn = divideContract.functions["execute"]();
    let to = []
    to.push({ to: heirs[0].getDepositAddress(), amount: installment  })
    to.push({ to: heirs[1].getDepositAddress(), amount: installment  })
    
    to.push(
      { to: executor.getDepositAddress(), amount: exFee - estimatedMinerFee - 2 }
    )
    
    await fn
      .to(to)
      .withoutChange()
      .send();
``` 

Note the above example does not strictly require the outputs be equal, nor exactly the minimum share. 

## Serialized examples: divide by four

In the case of a Divide contract among four inputs instead of two, the contract may be serialized for a keystore database (in a string of delimited text) as follows:

```
D,     // Type (Divide)
1,     // version
1200,  // executor/miner fee
a914cb75efdfd51ba11b81f2c7986dca8c3b78174f2487, // receipt 1
a9144ea5ce167a9656a601790eabca1e1165b1de9f1487, // receipt 2
a91496e199d7ea23fb779f5764b97196824002ef811a87 ,// receipt 3
a91405b471c045278ddc670a19415a47005929eb37c987, // receipt 4
a9141538fb59b073fbad92490eae961a12d542872f9a87  // contract lockingBytecode
```

As an OP_RETURN, the same [announced contract](https://explorer.bitcoinunlimited.info/tx/ce028ad05d4dcd6399294c5775cc513dc281b999b5107f80857205b49b783eee) might look like so:

```
6a           // 106 OP_RETURN
04 7574786f  // random protocol identifier
01 44        // Divide
01 01        // Version 1
02 b004      // 1200 sats allowance
17 a914cb75efdfd51ba11b81f2c7986dca8c3b78174f2487 // r0
17 a9144ea5ce167a9656a601790eabca1e1165b1de9f1487 // r1
17 a91496e199d7ea23fb779f5764b97196824002ef811a87 // r2
17 a91405b471c045278ddc670a19415a47005929eb37c987 // r3
17 a9141538fb59b073fbad92490eae961a12d542872f9a87 // check, locking bytecode
```

An interested party could check the unlocking bytecode [here](https://explorer.bitcoinunlimited.info/address/bitcoincash:pq2n376ekpelhtvjfy82a9s6zt259pe0ngv09mmq8x) and execute the contract by dividing inputs (if any are available) while paying themselves the executor fee.


# Complex functionality by chaining simple contracts

As a typical example of what someone may want, suppose instead of one heir, there are two heirs (age 12 and 15) who may, or may not, be very good with money, (we can't tell yet). While it should be possible to create a set of Locking and Will contracts to pay them out over time in the absence of the contract funder, that may get somewhat tedious.

Let's approximate the functionality of a Will and some Trusts with BitcoinScript. Here's what we use instead:
 
* A **Will** contract, which:
  * pays to itself or the funder if signed by the funder signature in some timeframe
  * **or** pays to a divide contract.
* The **Divide** contract splits any input equally (roughly)  among two addresses,
* One is a **Lock** contract for 8 years, the other **Lock**s for 5 years.
* Each Lock contract then pays a **Perpetuity**, (or **Annuity**), which distributes funds to an heirs address (at a later time) over some interval of about 15 years.

The same functionality could be approximated by using ~30 Will contracts paying ~30 Lock contracts, but it's simpler to use 1 Will, 1 Divide, 2 Time Locks and 2 Time Distribution contracts.


In pseudo `yml` code, as follows:
```yml
Will:
    exFee: 3000                             // 3k fee, after expiration 
    period: 24000                           // six months
    signature: <pk, sig>                    // principal's keys
    payTo:  
        Divide:
            fee: 3000                       // 3k fee
            payTo:                          // dividing remainder
                - Lock:
                    fee: 3000               // 3k fee
                    period: 384000          // 8 years
                    payTo:
                        Annuity: 
                            fee: 2000       // 2k fee, for
                            period: 4000    // monthly payments
                            amount: 100000  // of 100k
                            payTo: lock1    // to heir 1
                - Lock: 
                    fee: 3000               // 3k fee, for
                    period: 240000          // Lock for 5 years
                    payTo:              
                        Annuity:
                            fee: 2000        // 2k fee, for
                            period: 4000     // monthly payments
                            amount: 100000:  // of 100k
                            payTo: lock2            // to heir 2
```


# Considerations & Observations

With a set of small scripts using introspection (that are reviewed and thoroughly tested) a larger userbase could gain access to more complex functionality with more reliability than if they had to commission or implement a single large script and test it on their own dime/time.

However, there are some new considerations for the safety and generally tidiness that should probably have wider consideration here.

## Collision Attacks

Due to the possibility of collision attacks discussed previously here:

https://bitcoincashresearch.org/t/p2sh32-a-long-term-solution-for-80-bit-p2sh-collision-attacks/750/

https://bitcoincashresearch.org/t/2021-bch-upgrade-items-brainstorm/130/9 

https://bitcoincashresearch.org/t/chip-2022-05-pay-to-script-hash-32-p2sh32-for-bitcoin-cash/806

at this juncture, it should be assumed 1) that contracts that accept parameters for unlocking inputs are vulnerable to collision attacks, 2) that the output locking bytecode will be public and long-lasting, as well as 3) all data to redeem the script.

	at this juncture, it should be assumed 1) that contracts that accept parameters for unlocking inputs are vulnerable to collision attacks, 2) that the output unlocking bytecode will be public and long-lasting, as well as 3) all data to redeem the script.

Without something like [CHIP-2022-05 Pay-to-Script-Hash-32 P2SH32](https://gitlab.com/0353F40E/p2sh32/-/blob/main/CHIP-2022-05_Pay-to-Script-Hash-32_(P2SH32)_for_Bitcoin_Cash.md), the functionality of these anyone-can-spend contracts is (and should be) deliberately limited for security reasons.

Therefore:

* Variables passed to unlocking script should be minimized to the extent possible, ideally zero.
* Spending conditions should be limited (instead) to the value, number and locking bytecode of transaction inputs and outputs.



## Announcing Contracts

Bitcoin Cash sub-protocols have used a four-byte prefix in OP_RETURN [identifiers](https://github.com/bitcoincashorg/bitcoincash.org/blob/master/etc/protocols.csv) in the past. So known sets of contracts/covenants can be developed to utilize specific OP_RETURN prefixes. 

In addition, as a postfix to the OP_RETURN:

* It may be **very** expedient for users calling various contracts, (both as a checksum and to check balances) to have the locking bytecode of the contract (P2SH) in the contract announcement. It allows the "would be" caller to determine:
  * If the contract is funded, without instantiating the contract.
  * If they instantiated a funded contract correctly on their side

As some controversy in the memo/member protocol(s) has shown, it may be best to assume that someone will extend the protocol in ways initial developers don't wish to accommodate, so it might be best not to get married to a random four byte code.

### On announcing contracts v. covenants:


* A Contract with fixed parameters only needs to be announced once,
* A Covenant with changing parameters, can be made self-announcing. However:
  * If a four byte OP_RETURN space for a protocol is "claimed", self-announcing covenants shouldn't share space with fixed contracts. Because covenants may be announced every block, where covenants announcements are used once and discarded.

## P2PKH v. PSH v. LockingBytecode

* If contracts are to be composable, they should always favor asserting inputs & outputs as **lockingBytecode** over a PublicKeyHash or PublicScriptHash. 
* i.e. If a contract (P2SH) address is passed as output to another contract which enforces or assumes P2PKH outputs, it bricks those inputs forever.

### OP_Return length

* Presently, OP_RETURN is limited to 223 bytes, so if lockingBytecodes are stored in the contract announcement, the number of addresses involved is limited to five (or four plus the contract lockingBytecode shortcut/checksum).
* Current OP_RETURN size shouldn't be a limitation with current signature sizes. I.e. If inputs should, be divided by 4, they can be divided to 64 in three more steps―it is not worth a consensus change.

## Cleanup the dust as you go

* If a contract is not configured to utilize fractional satoshis and an ever decreasing DUST_LIMIT, it should **NOT** leave unspendable outputs on the contracts.
* Ephemeral contracts should be constructed with a dust collection mechanism and leave zero dust when funds are exhausted, even if those inputs are far below thresholds for the contract.

## Dust attacks, selective inputs

* It will be trivial with a small amount of bitcoin to dust a contract with tiny inputs such that the transaction fee required will exceed the allowance given, so software around protocols might consider enabling UTXO selection and dust collection by default, from launch.
* Likewise, it should always be assumed, when writing contracts, that the executor may call either all inputs, individual inputs, or some mix of both. 
  * As an example: a perpetuity paying daily into a two party divide contract may either be executed as inputs as a lump sum, or as 356 times on individual inputs for the year. If the daily input amount is low relative to the fee on the divide contract, the difference between calling individual inputs and one lump input could be significant.

## Insecurity on the network

With the nature of an anyone-can-spend contract, or the unrestricted output component, any party receiving the unlocking transaction may choose to replace the anyone-can-spend output with their own. Alternatively, the mempool can be monitored for anyone-can-spend transactions and any attempt to claim it may be "raced" as a double spend.  

In the latter case, a party who put in the effort to query, store and execute transactions in a timely manner could likely be thwarted by someone simply trying to double spend their small reward.

Finally, a miner who implemented software to spend all known anyone-can-outputs in blocks they mine would virtually eliminate any incentive for others to attempt to profit from submitting transactions (in blocks they mine with their hash power).

For the initial funder and ultimate recipient of the contract funds, it's immaterial whether the reward for executing the contract goes to someone who diligently submitted it, a double-spend cheater, or a sat pinching miner. The end result, that the contract is executed, is the same regardless of the party taking a small fee.

## Malleability

Similar to the above venerability to the executor outputs, it may be theoretically possible to generate outputs after the fact which are indistinguishable from the original using immutable checks using block headers, but are in fact not the original executor, rather a different address. However, at the present time, with such low fees, it seems unlikely that generating collisions would be profitable, and every spend of a UTXO would add to the cost of creating a spurious output and having it accepted on the network.

# Conclusion

The above topic outlines one view of how to go about enabling complex financial transactions from a set of well-known anyone-can-spend contracts. However these contracts may be disruptive to the network, have unconsidered security considerations or long term maintenance overhead that hasn't been considered.

So the general idea and some early pain-points are laid out to begin a broader discussion.
	Without something like [CHIP-2022-05 Pay-to-Script-Hash-32 P2SH32](https://gitlab.com/0353F40E/p2sh32/-/blob/main/CHIP-2022-05_Pay-to-Script-Hash-32_(P2SH32)_for_Bitcoin_Cash.md), the functionality of these anyone-can-spend contracts is (and should be) deliberately limited for security reasons.

Therefore:

* Variables passed to unlocking script should be minimized to the extent possible, ideally zero.
* Spending conditions should be limited (instead) to the value, number and locking bytecode of transaction inputs and outputs.



## Announcing Contracts

Bitcoin Cash sub-protocols have used a four-byte prefix in OP_RETURN [identifiers](https://github.com/bitcoincashorg/bitcoincash.org/blob/master/etc/protocols.csv) in the past. So known sets of contracts/covenants can be developed to utilize specific OP_RETURN prefixes. 

In addition, as a postfix to the OP_RETURN:

* It may be **very** expedient for users calling various contracts, (both as a checksum and to check balances) to have the locking bytecode of the contract (P2SH) in the contract announcement. It allows the "would be" caller to determine:
  * If the contract is funded, without instantiating the contract.
  * If they instantiated a funded contract correctly on their side

As some controversy in the memo/member protocol(s) has shown, it may be best to assume that someone will extend the protocol in ways initial developers don't wish to accommodate, so it might be best not to get married to a random four byte code.

### On announcing contracts v. covenants:


* A Contract with fixed parameters only needs to be announced once,
* A Covenant with changing parameters, can be made self-announcing. However:
  * If a four byte OP_RETURN space for a protocol is "claimed", self-announcing covenants shouldn't share space with fixed contracts. Because covenants may be announced every block, where covenants announcements are used once and discarded.

## P2PKH v. PSH v. LockingBytecode

* If contracts are to be composable, they should always favor asserting inputs & outputs as **lockingBytecode** over a PublicKeyHash or PublicScriptHash. 
* i.e. If a contract (P2SH) address is passed as output to another contract which enforces or assumes P2PKH outputs, it bricks those inputs forever.

### OP_Return length

* Presently, OP_RETURN is limited to 223 bytes, so if lockingBytecodes are stored in the contract announcement, the number of addresses involved is limited to five (or four plus the contract lockingBytecode shortcut/checksum).
* Current OP_RETURN size shouldn't be a limitation with current signature sizes. I.e. If inputs should, be divided by 4, they can be divided to 64 in three more steps―it is not worth a consensus change.

## Cleanup the dust as you go

* If a contract is not configured to utilize fractional satoshis and an ever decreasing DUST_LIMIT, it should **NOT** leave unspendable outputs on the contracts.
* Ephemeral contracts should be constructed with a dust collection mechanism and leave zero dust when funds are exhausted, even if those inputs are far below thresholds for the contract.

## Dust attacks, selective inputs

* It will be trivial with a small amount of bitcoin to dust a contract with tiny inputs such that the transaction fee required will exceed the allowance given, so software around protocols might consider enabling UTXO selection and dust collection by default, from launch.
* Likewise, it should always be assumed, when writing contracts, that the executor may call either all inputs, individual inputs, or some mix of both. 
  * As an example: a perpetuity paying daily into a two party divide contract may either be executed as inputs as a lump sum, or as 356 times on individual inputs for the year. If the daily input amount is low relative to the fee on the divide contract, the difference between calling individual inputs and one lump input could be significant.

## Insecurity on the network

With the nature of an anyone-can-spend contract, or the unrestricted output component, any party receiving the unlocking transaction may choose to replace the anyone-can-spend output with their own. Alternatively, the mempool can be monitored for anyone-can-spend transactions and any attempt to claim it may be "raced" as a double spend.  

In the latter case, a party who put in the effort to query, store and execute transactions in a timely manner could likely be thwarted by someone simply trying to double spend their small reward.

Finally, a miner who implemented software to spend all known anyone-can-outputs in blocks they mine would virtually eliminate any incentive for others to attempt to profit from submitting transactions (in blocks they mine with their hash power).

For the initial funder and ultimate recipient of the contract funds, it's immaterial whether the reward for executing the contract goes to someone who diligently submitted it, a double-spend cheater, or a sat pinching miner. The end result, that the contract is executed, is the same regardless of the party taking a small fee.

## Malleability

Similar to the above venerability to the executor outputs, it may be theoretically possible to generate outputs after the fact which are indistinguishable from the original using immutable checks using block headers, but are in fact not the original executor, rather a different address. However, at the present time, with such low fees, it seems unlikely that generating collisions would be profitable, and every spend of a UTXO would add to the cost of creating a spurious output and having it accepted on the network.

# Conclusion

The above topic outlines one view of how to go about enabling complex financial transactions from a set of well-known anyone-can-spend contracts. However these contracts may be disruptive to the network, have unconsidered security considerations or long term maintenance overhead that hasn't been considered.

So the general idea and some early pain-points are laid out to begin a broader discussion.