---
layout: none
---

<svelte:head>

<title>Vulnerability Disclosure: "Total Introspection Fallacy" v0 & v1 Unspent Phi Contract Deprecation [2023-08-30]</title>
</svelte:head>

# Vulnerability Disclosure: <br/> "Total Introspection Fallacy", <br/> Unspent Phi v0 & v1 Contract Deprecation [2023-08-30]   

While playing with a faucet contract in June 2023, the author discovered some unintended behavior. 

Dubbed "Total Introspection Fallacy", it allows one large input to satisfy the conditions for smaller inputs of a transaction, if the active index utxo value is conflated with the concept of "total" value. In an anyone-can-spend context like "Unspent Phi", this allows the lesser of any input funding a transaction to be spent in an unrestricted manner. The fallacy existed in *every* "Unspent Phi" contract prior to version 2. 

Impact:

If a user added new funds to an annuity or perpetuity contract, lesser value utxos could have been spent by anyone once all utxos had aged sufficiently. For example, if a perpetuity had a single utxo worth 2 BCH and someone sent an additional 1 BCH to the contract, the new coin could have been stolen in a transaction created using both utxos as inputs. 

Once the scope was determined:

- Some affected users were notified. 
- UI for creation of affected contract types was disabled. 
- A banner was added to warn existing users not to add more funds to existing contracts. 
- Contracts with substantial funds had inputs "merged" over time to protect the lessor utxos. 
- Finally, upgraded versions of all contracts were implemented, tested and audited. 

It is believed that no user funds were "lost" via this exploit. Most of the funds in annuities and perpetuities at risk were supplied for testing from initial funding efforts. Although there was about 5 BCH at risk when discovered, the value at risk has since been reduced to dust sats by merging utxos.

Upgraded contracts are now available that resolve this issue going forward by restricting transactions to a single input. There were a number of planned upgrades and precautions added at the same time. 

Users with existing perpetuities or annuities will continue to see regular payments from old contracts until funds are exhausted. However, new v2 contracts should be created if users want to add funds going forward. 

To prevent this mistake from being copied or reinvented on other projects, below is a more detailed explanation of the mistake and possible behavior. 

# TL;DR - There is no easy "total" with introspection OP_CODES.

There is no automatic total summation or aggregation with introspection operations. There is no `tx.inputs[*].value` to obtain a total sum in CashScript. 

If you're interested in writing your own contracts, **this is the mistake**:
```solidity
// [DOES NOT] Get the total value on the contract [Wrong]
int fakeTotalIn = tx.inputs[this.activeInputIndex].value;
```

If auditing someone else's contract, any comment or variable name implying a "total" should be a huge red flag, unless there is some logic summing or limiting inputs like so:


```solidity
// This is one way to prevent the fallacy, 
//    but not the only way.

// If limited to a single input
require(tx.inputs.length == 1);

// Then the zeroth input is also the total
int totalOfOneInput = tx.inputs[this.activeInputIndex].value;
```

The lack of aggregation operations was noted explicitly in the [introspection CHIP](https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md?ref=blog.bitjson.com#exclusion-of-aggregation-operations).  While this "taking the total" fallacy may appear to work for single inputs (or even multiple inputs crafted with user intent) the Bitcoin VM is **NOT** pushing the total of all inputs to the stack.


![total meme](images/total_recall.png "total meme")

Still confused? Hopefully the example below helps explain how the mistake could be made, overlooked, and enforced―as well as the concepts needed to spend funds in an unintended manner.

# A "Total Introspection Fallacy" Example

Say Bob wants to create a simple faucet.

Bob's faucet should pay 5000 sats once a day (every 144 blocks). 

This is how Bob commits *The Fallacy*, and sticks to it.

#### A first pass

Bob is a move fast and break stuff guy. He skips reading [CHIPs](https://bitcoincashresearch.org/c/chips/17) and doesn't memorize [OP_CODES](https://documentation.cash/protocol/blockchain/script.html#operation-codes-opcodes)<sup>[[2]](https://flowee.org/docs/spec/blockchain/script/)</sup>―which is fine. 

Instead, Bob finds some CashScript code from the internet and comes up with these lines for returning value to a faucet contract:

```solidity

// Check one day (144 blocks) has passed
require(tx.age >= 144);

... // incomplete code

// |||  WRONG! DO NOT COPY!         |||
// vvv  Here we commit the "Total fallacy"! vvv
int fakeTotal = tx.inputs[this.activeInputIndex].value;
// Not necessarily the real Total!

// Calculate value returned to the contract
int returnedValue = fakeTotal - 5000;

// Check that the outputs send the correct amounts
require(tx.outputs[0].value >= returnedValue);

```

This contract takes the value of the *active* input, and subtracts the payout to calculate the returned value.

Cash is cheap, so Bob funds the contract with a real mainnet "test" amount in one utxo, then returns the following day to successful spend an output with the correct faucet payout amount (minus fees). **It Works!**

In a ledger entry, the transaction might appear as follows:
```
// Bob's first faucet payment
//
utxo #1  100,000 sats  -> 95,000  sat  the faucet
                       ->  4,805  sat  payout
                       //    195  sat  fees
```

Here, the *"total introspection fallacy"* **worked** because Bob used a single input, the utxo input value pushed to the stack matched Bob's intent, it *was* the total. 

Emboldened with early success, Bob sends *more* funds to the same contract, which makes it slightly more interesting.

#### Multi-threaded unlocking fun

Bob wrote his contract in CashScript, which transpiled his contract to BitcoinScript codes. He could build his spending transaction with the Javascript API, or just use the [CashScript Playground](https://playground.cashscript.org/).

Assume, at some point in time, these are the utxos secured by his contract's Bob's faucet script:

```
| input   |      value |      age |
|         |     *sats* | *blocks* |
| utxo #1 |     95,000 |      150 |
| utxo #2 | 10,000,000 |      100 |
```

Remember that any input older than one day (144 block) can be spent. 
With the age of these utxos, if a transaction was created spending just the first 95k input, that returned 90,000 sats to the contract as an output, 5000 sats could be spent as reward to another output from the first utxo.

```
// Bob's second reward from the first utxo,
// but no reward from the second utxo, yet.
// 
utxo #1   95,000 sats  -> 90,000  sat  the faucet
                       ->  4,805  sat  reward, sent anywhere
                       //    195  sat  remainder is fee
```

This is *a slight* problem, because although the smaller inputs was just spent, the larger 10M sats can't be spent for 7 hours (44 blocks). 

Sending 5000 sats **twice** a day wasn't Bob's intent. With introspection, a transaction doesn't know about inputs that weren't used in the transaction, so there is no knowledge of the second utxo in script, nor all utxos that exist on a contract.

The contract can **multi-thread** *per utxo*. If there are two utxos, the contract could pay 5,000 twice a day; if there are ten (10) utxos, the faucet could pay 5,000 sats up to ten times a day! Each utxo that can satisfy the logic can run independently, simultaneously, or might be combined in a single transaction (in Bob's faucet).

Okay, while not Bob's original intent, Bob is a generous guy. He decides to modify the design of his faucet to match the implementation―problem solved!

And Bob found there is a way to merge multiple utxos like so:

```
// Bob spends both utxos at once, combining them to one
//   while claiming the reward
// 
utxo #1       90,000 sats  -> 10,085,000  sat  the faucet
utxo #2   10,000,000 sats  ->      4,805  sat  faucet reward
                           //        195  sat  remainder is fee
```

In the above transaction, adding both inputs together give enough output to satisfy both input conditions independently. But while it **may** be possible to merge multiple inputs and combine them according to Bob's intent, the faucet still has a **big** problem.

#### Rob'z Output [Exploit]

Rob knows about Bob's faucet, because funds have been spent from the script, therefore the redeem script is known.

Rob can see the script used `OP_INPUTINDEX` `OP_UTXOVALUE` without `OP_TXINPUTCOUNT`. Rob wrote a query against a database of all redeem scripts to find them.

Robert finds multiple unspent transaction outputs that exist on the contract's locking bytecode that have each sufficiently aged to be spent according to BIP-68: 

```
| input   |      value |      age |
|         |     *sats* | *blocks* |
| utxo #1 | 10,000,000 |      150 |
| utxo #2 |     95,000 |      250 |
```

With both of these utxos as inputs, Rob creates a transaction which spends more than intended at once from Bob's faucet:


```
// Rob takes ~100k sats in one transaction
// 
// This works, but wasn't what Bob intended.
utxo #1   10,000,000 sats  ->  9,995,000  sat  the faucet
utxo #2       95,000 sats  ->     99,805  sat  95k + "reward"
                           //        195  sat  remainder is fee
```

How? Remember how "fakeTotal" is defined:

```solidity
int fakeTotal = tx.inputs[this.activeInputIndex].value;
int returnedValue = fakeTotal - 5000;
require(tx.outputs[0].value >= returnedValue);
```

In the above transaction, `this.activeInputIndex` refers to *each* input.

When the first output (9,995,000 sats) is checked, ten million minus five thousand passes. 

**And** when the second input (95,000 sats) is checked...

```solidity
 int fakeTotal = 95,000; // sats
// int fakeTotal = tx.inputs[this.activeInputIndex].value;

 int returnedValue = 95,000 - 5000;
// int returnedValue = fakeTotal - 5000;

// This is true, ~10M is much greater than 90k
require (9,995,000    >= 90,000);
//require(tx.outputs[0].value >= returnedValue);
```

Rob still can't spend the larger 10M sat input, but in this case, the conflation of *each* input index with *all* input indices allows Rob to take any utxo that is satisfied by a larger utxo at the same time.

# Conclusion

The deployment of Native Introspection OpCodes on Bitcoin Cash in May 2022 was a great leap forward in scripting power, however generic [aggregation operations](https://gitlab.com/GeneralProtocols/research/chips/-/blob/master/CHIP-2021-02-Add-Native-Introspection-Opcodes.md?ref=blog.bitjson.com#exclusion-of-aggregation-operations) simply weren't included in that upgrade.

It's easy to miss that one feature is missing when playing with new OpCodes. It's also possible to coast fairly well for a long time on a fallacy. But eventually, it's better to have read the documentation first. 

In summary, we:

 - Highlighted one important point regarding introspection (Exclusion of Aggregation). 
 - Showed a quick hack to cheaply obtain the sum of all inputs (require a single input). 
 - Showed how to fall into the "total" fallacy and take funds from contracts that have. 

For Unspent Phi contracts, anyone may attempt to spend (or "mis-spend") a contract. In a more traditional transaction context with signed inputs, there may be a lot fewer potential advisories who even know of a contract. A mistake could persist for years or decades without issue. 

Whether writing a sophisticated swap, a crazy nft logic puzzle or a mundane financial instrument, you're now aware of the "Total Introspection Fallacy" and how not to fall into it. 

Happily, the mistake was repeated (or arrived at independently) by several other developers building completely different contracts. In some of those instances, the issue was identified and reported early in the design phase. Hallucinating or assuming introspection aggregation is an issue that is becoming increasingly easy for a larger number of people to identify. So it's increasingly less likely that a contract that is reviewed or made public will come to pose a significant risk to user funds. 

That's it! That's the missing magic of introspection and how to abuse it.