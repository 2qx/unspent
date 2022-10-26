import { ElectrumCluster, ClusterOrder, ElectrumTransport } from "electrum-cash"
import { Contract, ElectrumNetworkProvider } from "cashscript"
import { RegTestWallet, mine as mineBlocks } from "mainnet-js"
import { binToHex, hexToBin, bigIntToBinUintLE, bigIntToScriptNumber } from "@bitauth/libauth";
import { getRandomInt } from "mainnet-js/dist/main/util";
import { sha256, sum, deriveLockingBytecodeHex } from "../../../common/util.js";
import { artifact as v1 } from "./v1.js"
import { _PROTOCOL_ID } from "../../../common/constant.js";



describe(`Mining Contract Tests`, () => {



    test("Should pay a mining contract 10 times in 10 blocks", async () => {

        let regTest = new ElectrumCluster('utxfi-tests - faucet', '1.4.1', 1, 1, ClusterOrder.PRIORITY);
        regTest.addServer('127.0.0.1', 60003, ElectrumTransport.WS.Scheme, false);
      
        let regtestNetwork  = new ElectrumNetworkProvider("regtest",regTest, false)
    
        const alice = await RegTestWallet.fromId(process.env['ALICE_ID']!);
        const bob = await RegTestWallet.fromSeed(
            "rubber amateur across squirrel deposit above dish toddler visa cherry clerk egg"
        );

    
        let period = 1;
        let payout = 5000;
        let difficulty = 1;
        let index = new Uint8Array(7);

        let contract = new Contract(
            v1,
            [period, payout, difficulty,  index],
            regtestNetwork
        );

        // fund the inital mining contract
        await alice.send([
            {
                cashaddr: contract.address!,
                value: 510000,
                unit: "satoshis",
            },
        ]);

        for (let x = 0; x < 3; x++) {
            await mineBlocks({
                cashaddr: "bchreg:ppt0dzpt8xmt9h2apv9r60cydmy9k0jkfg4atpnp2f",
                blocks: 1,
            });
            let balance = await contract.getBalance();
            let mined = false
            let nonce = 0

            let nonceBin = new Uint8Array([])
            let result = new Uint8Array([])
            while(!mined){
                nonce = getRandomInt(9007199254740991)
                nonceBin = bigIntToScriptNumber(BigInt(nonce))
                let msg = new Uint8Array([...hexToBin(contract.getRedeemScriptHex()), ...nonceBin])
                result = await sha256(msg)
                if(result.slice(0,difficulty).reduce(sum) === 0) mined = true
            }

            if(nonceBin.length < 7){
                let zeros = 7-nonceBin.length
                nonceBin = new Uint8Array( [... nonceBin, ... new Uint8Array(zeros)])
            }

            let nonceHex = binToHex(nonceBin)
            
            let fn = contract!.functions["execute"]!(nonceHex);

            let newContract = new Contract(
                v1,
                [period, payout, difficulty, nonceHex],
                regtestNetwork
            );

            //console.log(payout)
            let tx = await fn
                .withOpReturn([_PROTOCOL_ID,'M','0x01', '0x01', '0x8813', '0x0'+ difficulty, '0x'+nonceHex, '0x'+ deriveLockingBytecodeHex(newContract.address)])
                .to([
                    {
                        to: newContract.address,
                        amount: (balance - payout) + 3,
                    },
                    { to: bob.getDepositAddress(), amount: payout - 453 }
                ])
                .withAge(1)
                .withoutChange()
                .send();
            //console.log(tx.txid)
            contract=newContract
        }

        expect(await bob.getBalance("sat")).toBeGreaterThanOrEqual((payout - 453)*3);
    });

   
});
