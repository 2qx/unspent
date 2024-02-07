import { binToHex } from "@bitauth/libauth";
import {
  ElectrumCluster,
  ClusterOrder,
  ElectrumTransport,
} from "electrum-cash";
import {
  Contract as CashScriptContract,
  ElectrumNetworkProvider,
} from "cashscript";
//@ts-ignore
import { RegTestWallet } from "mainnet-js";
import { artifact as v2 } from "./v2.js";
import { Divide } from "../../divide/index.js";
import {
  createOpReturnData,
  decodeNullDataScript,
  hash160,
} from "../../../common/util.js";
import { Network } from "../../../common/interface.js" 
import { getAnAliceWallet } from "../../../test/aliceWallet4test.js";

describe(`Record Contract Tests`, () => {
  

  test("Should record a division contract on regtest.", async () => {
    let regTest = new ElectrumCluster(
      "utxfi-tests - record",
      "1.4.1",
      1,
      1,
      ClusterOrder.PRIORITY
    );
    regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

    let provider = new ElectrumNetworkProvider("regtest", regTest, false);

    let maxFee = 850n;
    let script = v2;
    let contract = new CashScriptContract(script, [maxFee, 0n], { provider: provider, addressType:"p2sh32" });
    let bob = await RegTestWallet.newRandom();
    let charlie = await  RegTestWallet.newRandom();
    let c = new Divide(
      4000n,
      [
        bob.getDepositAddress(),
        charlie.getDepositAddress(),
      ],
      { version: 2, network: "regtest" }
    );

    let opReturn = c.toOpReturn();

    // fund the contract
    const alice = await getAnAliceWallet(10000);
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 9000,
        unit: "satoshis",
      },
    ]);


    let chunks = decodeNullDataScript(opReturn).map((c) => "0x" + binToHex(c));
    if (typeof opReturn === "string") throw opReturn;
    let checkHash = await hash160(opReturn);

    let utxo = (await contract.getUtxos()).pop()
    let tmp = await contract!.functions["execute"]!(checkHash)
      .withOpReturn(chunks)
      .withHardcodedFee(369n);

    let size = BigInt((await (tmp.build())).length/2)
    tmp = contract!.functions["execute"]!(checkHash)
      .withOpReturn(chunks)
      .from(utxo!)
      .to(contract.address, 9000n-size)
      .withMinChange(1000n);

    let result = await tmp.send();
    expect(await contract.getBalance()).toBeGreaterThan(8000n);
  });


  test("Should cat an authentication template.", async () => {
    let regTest = new ElectrumCluster(
      "utxfi-tests - record",
      "1.4.1",
      1,
      1,
      ClusterOrder.PRIORITY
    );
    regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

    let provider = new ElectrumNetworkProvider("regtest", regTest, false);

    let maxFee = 850n;
    let script = v2;
    let contract = new CashScriptContract(script, [maxFee, 0n], { provider: provider, addressType:"p2sh32" });
    let c = new Divide(
      4000n,
      [
        "bchreg:pvclqejht9ggdc5s5g3d97m6yl0sau69wqjjr6qs22ys99vq64uhsa408s2j4",
        "bchreg:pvclqejht9ggdc5s5g3d97m6yl0sau69wqjjr6qs22ys99vq64uhsa408s2j4",
      ],
      { version: 2, network: "regtest" }
    );

    let opReturn = c.toOpReturn();

    // fund the contract
    const alice = await getAnAliceWallet(55000);
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 50000,
        unit: "satoshis",
      },
    ]);

    

    let chunks = decodeNullDataScript(opReturn).map((c) => "0x" + binToHex(c));
    if (typeof opReturn === "string") throw opReturn;
    let checkHash = await hash160(opReturn);

    let transaction = await contract!.functions["execute"]!(checkHash)
      .withOpReturn(chunks)
      .withHardcodedFee(BigInt(500n) / 2n);



  });
});
