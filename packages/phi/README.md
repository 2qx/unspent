# Unspent Phi

A collection of CashScript contracts and javascript wrappers for calculating and spending simple anyone-can-spend instruments on the Bitcoin Cash (BCH) blockchain.

This package is used in @unspent/cli and the @unspent/app webapp.

Usage

    yarn add @unspent/phi

ESM

    import {
      Faucet
    } from "@unspent/phi";

    let f = new Faucet();

    f.toString()
    // F,1,1,1000,1,...

    f.execute(<your cashaddress>)
