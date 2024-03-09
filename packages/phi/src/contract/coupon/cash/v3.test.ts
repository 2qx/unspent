import { Artifact, Contract, SignatureTemplate, MockNetworkProvider, randomUtxo } from "cashscript";
import { cashAddressToLockingBytecode, binToHex } from "@bitauth/libauth"
import { artifact as v3 } from "./v3.js";
import { artifact as futureV3 } from "../../euro/cash/v3.js";
import { getAnAliceWallet } from "../../../test/aliceWallet4test.js";
import 'cashscript/dist/test/JestExtensions';

// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

describe(`Futures Tests`, () => {




  test("Should cat debug url", async () => {

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

    const future = new Contract(futureV3, [locktime, tokenId], { provider });
    let lock = cashAddressToLockingBytecode(future.address)
    if (typeof lock === "string") throw lock;
    const coupon = new Contract(v3, [lock.bytecode], { provider });

    provider.addUtxo(coupon.address, randomUtxo({
      satoshis: 103_000n,
    }));


    let couponUtxo = (await provider.getUtxos(coupon.address))[0]

    console.log(future.address)
    const transaction = coupon.functions.apply()
      .to([{ to: future.address, amount: 101_500n }])
      .from(couponUtxo)

      .withoutChange();

    const uri = await transaction.bitauthUri();

    await expect(transaction.debug()).resolves.not.toThrow();

  });

  test("Should apply coupon to designated address", async () => {

    const provider = new MockNetworkProvider();

    let destinationAddress = "bchtest:pdp40uyrx48em3h47kvarsjdvm9eglzsmczjdkkl2pplmr97caqa6uju2t8ru"
    let lock = cashAddressToLockingBytecode(destinationAddress)
    if (typeof lock === "string") throw lock;
    const coupon = new Contract(v3, [lock.bytecode], { provider });
    provider.addUtxo(coupon.address, randomUtxo({
      satoshis: 103_000n,
    }));



    const transaction = coupon.functions.apply()
      .to(destinationAddress, 101_700n)
      .withoutChange();
    let result = transaction.send()
    await expect(result).resolves.not.toThrow();
  });

});
