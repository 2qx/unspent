import { ElectrumCluster, ClusterOrder, ElectrumTransport } from "electrum-cash"
import { Contract, ElectrumNetworkProvider } from "cashscript"
import { RegTestWallet, mine } from "mainnet-js"
import { artifact } from "./v1"

describe(`Faucet Contract Tests`, () => {


    test("Should pay a faucet contract 10 times in 10 blocks", async () => {

        let regTest = new ElectrumCluster('utxfi-tests - faucet', '1.4.1', 1, 1, ClusterOrder.PRIORITY);
        regTest.addServer('127.0.0.1', 60003, ElectrumTransport.WS.Scheme, false);
      
        let regtestNetwork  = new ElectrumNetworkProvider("regtest",regTest, false)
    
        const alice = await RegTestWallet.fromId(process.env['ALICE_ID']!);
        const bob = await RegTestWallet.fromSeed(
            "rubber amateur across squirrel deposit above dish toddler visa cherry clerk egg"
        );

        let payout = 5000;
        let index = 1;
        let period = 1;
        let contract = new Contract(
            artifact,
            [period, payout, index],
            regtestNetwork
        );

        // fund the perp contract
        await alice.send([
            {
                cashaddr: contract.address!,
                value: 510000,
                unit: "satoshis",
            },
        ]);



        for (let x = 0; x < 10; x++) {
            await mine({
                cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
                blocks: 1,
            });
            let balance = await contract.getBalance();
            let fn = contract!.functions["drip"]!();
            await fn
                .to([
                    {
                        to: contract.address,
                        amount: (balance - payout) + 3,
                    },
                    { to: bob.getDepositAddress(), amount: payout - 153 }
                ])
                .withAge(1)
                .withoutChange()
                .send();
        }

        expect(await bob.getBalance("sat")).toBeGreaterThanOrEqual((payout - 153)*10);
    });

   
});
