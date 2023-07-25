import {
  ElectrumCluster,
  ClusterOrder,
  ElectrumTransport,
} from "electrum-cash";
import { cashAddressToLockingBytecode, binToHex, hexToBin, lockingBytecodeToCashAddress } from "@bitauth/libauth";
import {
  Contract as CashScriptContract,
  ElectrumNetworkProvider,
} from "cashscript";
import { RegTestWallet } from "mainnet-js";
import { artifact as v2_4 } from "./4.v2.js";

describe(`Example Divide Tests`, () => {
  test("Should pay a divisor contract", async () => {
    let regTest = new ElectrumCluster(
      "CashScript Application",
      "1.4.1",
      1,
      1,
      ClusterOrder.PRIORITY
    );
    regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

    let regtestNetwork = new ElectrumNetworkProvider("regtest", regTest, false);

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
    let bobs: RegTestWallet[] = [];
    let divisor = 4n;
    for (let i = 0n; i < divisor; i++) {
      bobs.push(await RegTestWallet.newRandom());
    }
    let bobLockingCodes: string[] = [];
    for (let i = 0; i < divisor; i++) {
      let lockingBytecodeResult = cashAddressToLockingBytecode(
        bobs[i]!.getTokenDepositAddress()
      );
      if (typeof lockingBytecodeResult === "string")
        throw lockingBytecodeResult;
      bobLockingCodes.push(binToHex(lockingBytecodeResult.bytecode) as string);
    }

    let charlie = await RegTestWallet.newRandom();

    let exFee = 5000n;

    const script = v2_4;
    //console.log(script)
    let contract = new CashScriptContract(
      script,
      [exFee, divisor, ...bobLockingCodes],
      {provider : regtestNetwork, addressType:"p2sh32"}
    );

    //console.log(`D:1:${exFee}:` + bobPkhs.map(i=> `${i}`).join(":"))
    // fund the perp contract
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 68000000,
        unit: "satoshis",
      },
    ]);

    let contracts = [contract];
    let balance = await contracts.slice(-1)[0]!.getBalance();
    let installment = (balance - exFee) / divisor;
    let fn = contracts.slice(-1)[0]!.functions["execute"]!();

    let to: any = [];
    for (let i = 0; i < divisor; i++) {
      to.push({ to: bobs[i]!.getDepositAddress(), amount: installment });
    }
    to.push({ to: charlie.getDepositAddress(), amount: exFee - 2000n });

    await fn.to(to).withoutChange().send();

    for (let i = 0; i < divisor; i++) {
      expect(await bobs[i]!.getBalance("sat")).toBeGreaterThanOrEqual(
        installment
      );
    }
  });

  test("Should pay a divisor contract configured to four (4) p2sh32 addresses", async () => {
    let regTest = new ElectrumCluster(
      "CashScript Application",
      "1.4.1",
      1,
      1,
      ClusterOrder.PRIORITY
    );
    regTest.addServer("127.0.0.1", 60003, ElectrumTransport.WS.Scheme, false);

    let regtestNetwork = new ElectrumNetworkProvider("regtest", regTest, false);

    const alice = await RegTestWallet.fromId(process.env["ALICE_ID"]!);
  
    let divisor = 4n;
    const p2sh32 = hexToBin(
      'aa20000000000000000012345678900000000000000000000000000000000000000087'
    );
    
    let cashaddr = lockingBytecodeToCashAddress(p2sh32, "bchreg")
    if(typeof cashaddr != `string`)  throw (cashaddr)
    let bobs = await RegTestWallet.watchOnly(cashaddr)
    let charlie = await RegTestWallet.newRandom();

    let exFee = 5000n;

    const script = v2_4;
    //console.log(script)
    let contract = new CashScriptContract(
      script,
      [exFee, divisor, ...Array(4).fill(p2sh32)],
      {provider : regtestNetwork, addressType:"p2sh32"}
    );

    // fund the divisor contract
    await alice.send([
      {
        cashaddr: contract.address!,
        value: 68000000,
        unit: "satoshis",
      },
    ]);

    let contracts = [contract];
    let balance = await contracts.slice(-1)[0]!.getBalance();
    let installment = (balance - exFee) / divisor;
    let fn = contracts.slice(-1)[0]!.functions["execute"]!();

    let to: any = [];
    for (let i = 0; i < divisor; i++) {
      to.push({ to: cashaddr, amount: installment });
    }
    to.push({ to: charlie.getDepositAddress(), amount: exFee - 2000n });

    let tx = fn.to(to).withoutChange();
    let size = await tx.build()
    await tx.send()

    for (let i = 0; i < divisor; i++) {
      expect(await bobs.getBalance("sat")).toBeGreaterThanOrEqual(
        installment*4n
      );
    }
  });
});
