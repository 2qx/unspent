
import { Contract, TransactionBuilder, SignatureTemplate, MockNetworkProvider, randomUtxo } from "cashscript";
import { artifact as v3 } from "./v3.js";
import { getAnAliceWallet } from "../../../test/aliceWallet4test.js";
import 'cashscript/dist/test/JestExtensions';

describe(`Futures Tests`, () => {


  test("Should allow locking coins", async () => {




    const provider = new MockNetworkProvider();

    let startingBlockHeight = await provider.getBlockHeight()
    console.log(startingBlockHeight)
    // select locktime one block in the past
    let locktime = BigInt(startingBlockHeight - 1);

    const alice = await getAnAliceWallet(100006000)
    const genesisResponse = await alice.tokenGenesis({
      amount: BigInt(2.1e+15),
    });
    const tokenId = genesisResponse.tokenIds![0];

    const contract = new Contract(v3, [locktime, tokenId], { provider });




    let aliceTemplate = new SignatureTemplate(alice.privateKey!)



    provider.addUtxo(alice.getDepositAddress(), randomUtxo({
      satoshis: 100_003_000n,
    }));

    let aliceUtxo = (await provider.getUtxos(alice.getDepositAddress()))[0]

    provider.addUtxo(contract.address, randomUtxo({
      satoshis: 1000n,
      token: {
        amount: 100_000_000n,
        category: tokenId
      },
    }));

    let contractUtxo = (await provider.getUtxos(contract.address))[0]


    const transaction = contract.functions.placeOrRedeem(false)
      .from(contractUtxo)
      .fromP2PKH(aliceUtxo, aliceTemplate)
      .to(contract.address, 100_001_000n)
      .to(alice.getTokenDepositAddress(),
        1000n,
        {
          amount: 100_000_000n,
          category: tokenId
        }
      )
      .withoutChange()
      .withTime(startingBlockHeight);


    const uri = await transaction.bitauthUri();
    console.log(uri)

    await expect(transaction.debug()).resolves.not.toThrow();

  });



});
