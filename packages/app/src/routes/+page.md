---
layout: splash
---

<svelte:head>

<title>Unspent Phi</title>
</svelte:head>

# How-To `Unspent` 

>   **Get money, don't spend all of it.**

This app is for saving money for regular distribution over a long period of time. The core feature is a trustless irrevocable contract that anyone can customize, publish and fund themselves.

There are no fiat prices, no markets. Nothing is traded. All contracts are single party. Contracts do not co-mingle funds, nor do they rely on outside data. Contracts exist on the base layer of the Bitcoin Cash blockchain, and can continue to function without this webpage.

Anyone can put their own money on a contract they created and get the same money back over time. This app allows anyone to do the math to calculate the locking code. This app does not provide any services.

## Get your Bitcoin Cash

Get a wallet that can hold Bitcoin Cash with a private key or secret you keep and control. There are [dozens of great open-source wallets](https://awesomebitcoin.cash/#open-source-wallets) that can hold, sign and send Bitcoin Cash, but Unspent.app simply isn't one of those wallets (it's in a browser) so it doesn't hold user funds.

Once you have a Bitcoin Cash wallet, find some way to add some funds to your wallet. Pick an address you control and get comfortable sending and receiving funds to your own address. Once you have an address you know you control, you're ready to move one to the next step.

**BEWARE: There are MANY scam apps and sites** that show a Bitcoin Cash (BCH) balance **without** the ability to actually control or reliably withdraw funds. 

Any funds sent to the deposit address at an exchange or third-party institution that represent some stake or interest in as a ledger entry in an omnibus account should be assumed lost forever. (Apps that hold user funds in omnibus (grouped) accounts, are not even custodial)

## Design your Plan

The Unspent Phi Perpetuity contract is like a clear drop safe with a simple crank lever.

There is a small stipend to pay a fraction of value out at regular intervals. **Anyone** may attempt to create a transaction to spend the funds, however, the contract restricts how the funds may be spent with code. As long as the transaction follows *each* rule and criteria, the contract will be satisfied and the transaction will be accepted on the network.

Below is a simplified example for Alice's contract:

![Alice's perpetuity](images/perp.svg "Alice's forever money.")

The highlighted values (Alice's address, the time frame, rate etc.) determine the specific locking code for Alice's contract, and therefore the address. 

Several standard plans are available paying at regular intervals that each last for several decades. The parameters can be adjusted under the advanced settings.

The "Show Schedule" button should give a rough indication of how long it will take for the contract to pay out completely.

![sample schedule](images/schedule.png "Show Schedule")

## Publish your Plan

Once your plan looks right, hit the "Broadcast" button. 

![broadcast](images/broadcast.png "Broadcast Button")

This action should publish the details of the contract, including the parameters to unlock it and a checksum.

You can verify in a block explorer that the details were recorded.  The data shown on the publish transaction should match the *Serialized OpReturn* of your contract.

## Fund your Contract

Once you have your contract published, it's time to fund it. 

Here, you have to decide what amount of money you'd be okay losing; or conversely, how much you'd still like to have if you lost everything.

The contract doesn't need to be funded entirely in one transaction. A small trial amount may be tested to see that the contract functions as intended and to the correct address before being funded with a larger amount. 

If you selected a monthly contract, the first payment will be available the following month. A weekly contract would be spendable one week after the first input.

Funds sent to the contract are not mixed or combined with others. So if ten different deposits are sent to a monthly contract for a year, the contract will payout 10 times a month. A hundred individual payments funding a weekly contract will result in a hundred payments a week, etc.

THE END. [click here to proceed.](/create)
