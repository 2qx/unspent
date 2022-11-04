A utility for calling unspent contracts via the command line.


PRs welcome!

---


━━━ @unspent/cli - 0.0.1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  $ @unspent/cli <command>

━━━ Beneficiary ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @unspent/cli annuity [--testnet] [--regtest] [--fee #0] [--deposit] <--address #0> [--period #0] [--allowance #0] <--installment #0> [--exAddress #0]
    Regular payments over time

  @unspent/cli divide [--testnet] [--regtest] [--fee #0] [--allowance #0] <--addresses #0> [--exAddress #0]
    Divide money into equal payments, up to four addresses

  @unspent/cli perpetuity [--testnet] [--regtest] [--fee #0] [--deposit] <--address #0> [--period #0] [--allowance #0] [--decay #0] [--exAddress #0]
    Pay a fixed fraction of total value at intervals.

━━━ Distributive ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @unspent/cli faucet [--testnet] [--regtest] [--fee #0] [--address #0] [--period #0] [--payout #0] [--index #0]
    Distributes some free bitcoin per period

  @unspent/cli mine [--testnet] [--regtest] [--fee #0] [--deposit] [--period #0] [--payout #0] [--difficulty #0] [--canary #0] <--exAddress #0>
    Distributes some bitcoin per period, for proof of work

━━━ Informational ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @unspent/cli query [--testnet] [--regtest] <--chaingraph #0> [--prefix #0]
    Query a list of contracts.

  @unspent/cli record [--testnet] [--regtest] [--fee #0] [--maxFee #0] [--index #0] [--contract #0]
    Broadcast a contract to the blockchain