---
layout: splash
---

<svelte:head>

<title>Frequently Asked Questions</title>
</svelte:head>


# What financial risks are there?

This is a site to let people do math (on their own computers) to lock their own money.

- There are a number of safeguards in place to prevent people from creating a "bad" lock, or contract that locks funds that can never be unlocked.
- It is also possible to create an instrument that pays high fees for execution, i.e. where more allowance is paid in fees than principal. 

There is no guarantee, but the aim is to provide an instrument that gives a more even distribution of value than if funds had remained completely liquid. 

Low transaction fees means it's essentially free to create a small test contract. The design is to allow saving small amounts and allow those small savings to be well preserved over time. 

# What risks specific to the contract data exist? 

Unspent Phi contracts can be stepped forward by anyone, however, the existence of the contract must be known for that to work. 

The app allows users to tag data about their contract to the blockchain so they don't have to remember. 

If Alice makes some timelocked contract, but doesn't publish the contract details using the "Broadcast" feature, then no one (including Alice) may remember how to execute the contract when it's time.

This risk can be reduced or eliminated by:

- simply using the default parameters for a contract
- keeping track of the address and settings as a note in a wallet or off-line
- making sure the transaction recording contract is included in a block before funding the contract.

# What bitcoin-specific risks are there?

Unspent Phi contracts created by users employ various operation codes specific to the May 2022 rule-set of Bitcoin Cash.

If certain codes were disabled in the future, existing contracts may cease functioning. 

If a network "chain-fork" occurs, assets may exist on both chains. If the necessary operation codes remain enabled on both chains, contracts may continue to operate on both networks. If one chain changes the network blocktime, difficulty adjustment algorithm or existing rule-set, those contracts may be altered or broken.


# How do I withdraw the funds from an annuity or perpetuity?

Annuities have a fixed amount that can be withdrawn at regular intervals. Perpetuities have a fixed fraction that can be withdrawn at regular intervals. 

There is no mechanism to liquidate the contracts early or withdraw prematurely by design.

The irrevocable nature of the contracts is a feature.


# What privacy is there?

Using the same receiving address for decades is bad for privacy. 

However, there are lots of address with hundreds of thousands or even millions of coins. The entities that custody the funds are widely known, and even the mechanisms used to guard the funds are know.

Security and privacy are problems that scale well as wealth increases.


# What service is provided by this site?

None. This site is strictly software, without warranty or guarantee.

This webpage can be rendered from a web browser cache or CDN.

There are no specialized servers for rendering or computation, no central database and no central control.

The functionality is also available from a [command line utility](https://www.npmjs.com/package/unspent) or by pasting CashScript and the parameters into the [playground](https://playground.cashscript.org/)

# Is Unspent Phi or ₿∙ϕ a charity, trademark or entity?

Nope.

Anyone can use the idea of modular anyone can spend transactions and call it Unspent Phi. (Anyone is free to create a forked or broken version and call it the genuine article, this is bitcoin after all.)

Unspent Phi isn't a charity. This software doesn't provide income tax or investment advice. 

