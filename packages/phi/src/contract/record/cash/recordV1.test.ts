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
import { artifact as v1 } from "./v1.js";
import { Divide } from "../../divide/index.js";
import {
  createOpReturnData,
  decodeNullDataScript,
  hash160,
} from "../../../common/util.js";

describe(`Record Contract Tests`, () => {
  test("Should record a division contract.", async () => {
    let regTest = new ElectrumCluster(
      "utxfi-tests - record",
      "1.4.1",
      1,
      1,
      ClusterOrder.PRIORITY
    );
    regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

    let regtestNetwork = new ElectrumNetworkProvider("regtest", regTest, false);

    let maxFee = 850n;
    let script = v1
    let contract = new CashScriptContract(script, [maxFee, 2n], { provider: regtestNetwork, addressType: 'p2sh20' });

    // fund the contract
    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 50000,
        unit: "satoshis",
      },
    ]);

    let c = new Divide(
      4000n,
      [
        "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
        "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
        "bchreg:qr83275dydrynk3s2rskr3g2mh34eu88pqar07tslm",
        "bchreg:qzdf6fnhey0wul647j2953svsy7pjfn98s28vgv2ss",
      ],
      { version: 1, network: "regtest" }
    );

    let opReturn = c.toOpReturn();
    let chunks = decodeNullDataScript(opReturn).map((b) => "0x" + binToHex(b));
    if (typeof opReturn === "string") throw opReturn;

    let checkHash = await hash160(opReturn);

    let test = await contract!.functions["execute"]!(checkHash)
      .withOpReturn(chunks)
      .withHardcodedFee(279n)
      .build();
    await contract!.functions["execute"]!(checkHash)
      .withOpReturn(chunks)
      .withHardcodedFee(BigInt(test.length) / 2n)
      .send();
    expect(await contract.getBalance()).toBeGreaterThanOrEqual(
      50000 - test.length / 2
    );
  });

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
    let script = v1;
    let contract = new CashScriptContract(script, [maxFee, 0n], { provider: provider, addressType:"p2sh20" });
    let c = new Divide(
      4000n,
      [
        "bchreg:pzt2852zlgtyqu6585wtu72y2u8646tefsa54drfw8",
        "bchreg:pq75zmtt8d84nqnxv8vx3wj06mmzlhjnwus03a55xe",
        "bchreg:pzvv2yhpsq2twj3kxgmsd76de4y785d3evpjtdwver",
        "bchreg:pzpzxvw8kluds32v3lpa9mq43l2rdpny65qp7nluud",
      ],
      { version: 1, network: "regtest" }
    );

    let opReturn = c.toOpReturn();

    // fund the contract
    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
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

    let tmp = await contract!.functions["execute"]!(checkHash)
      .withOpReturn(chunks)
      .withHardcodedFee(369n)
      .build();
    await contract!.functions["execute"]!(checkHash)
      .withOpReturn(chunks)
      .withHardcodedFee(BigInt(tmp.length) / 2n)
      .send();
    expect(await contract.getBalance()).toBeGreaterThanOrEqual(50000 - 369);
  });
});
