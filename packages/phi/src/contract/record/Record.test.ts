import { Record } from "./Record"
import { Divide } from "../divide/index"
import { RegTestWallet } from "mainnet-js"

describe(`Record Class Tests`, () => {

    test("Should announce itself and Divider", async () => {

        let options = {version:1, network:"regtest"}
        let r = new Record(850,0,options)
        // fund the contract
        const alice = await RegTestWallet.fromId(process.env['ALICE_ID']!);
        await alice.send([
            {
                cashaddr: r.getAddress(),
                value: 50000,
                unit: "satoshis",
            },
        ]);   

        let tx2 = await r.broadcast()
        expect(r.toChunks()).toEqual(
            [
                'R',
                '0x01',
                '0x0352',
                '0x00',
                '0xa91496e199d7ea23fb779f5764b97196824002ef811a87'
              ]
        )
        expect(r.toString()).toEqual("R,1,850,0,a91496e199d7ea23fb779f5764b97196824002ef811a87")
        expect(tx2.outputs[0]!.lockingBytecode).toStrictEqual(new Uint8Array([
            // op return
            106, 
            // 4 byte protocol id
            4, 98, 97, 110, 107,
            // R
            1, 82,
            // 1
            1, 1,
            // 850
            2, 3,82,
            // 0
            1, 0,
            // 0x96e199d7ea23fb779f5764b97196824002ef811a
            23,
            169, 20,
            150,225,153,215,234, 35,251,119,159, 87,
            100,185,113,150,130, 64,  2,239,129, 26,
            135
            ]
             )
             )
    });




    test("Should announce itself and Divider", async () => {
        // let payees = [
        //     "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
        //     "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
        //     "bchreg:qr83275dydrynk3s2rskr3g2mh34eu88pqar07tslm",
        //     "bchreg:qzdf6fnhey0wul647j2953svsy7pjfn98s28vgv2ss",
        //     "bchreg:qpddvxmjndqhqgtt747dqtrqdjjj6yacngmmah489n",
        //     "bchreg:qz6285p7l8y9pdaxnr6zpeqqrnhvryxg2vtgn6rtt4",
        //     "bchreg:qr83275dydrynk3s2rskr3g2mh34eu88pqar07tslm",
        //     "bchreg:qzdf6fnhey0wul647j2953svsy7pjfn98s28vgv2ss"
        // ]
        let options = {version:1, network:"regtest"}
        // //let d = new Divide(4000, payees, options)
        let r = new Record(850,1,options)
        
        // fund the contract
        const alice = await RegTestWallet.fromId(process.env['ALICE_ID']!);
        await alice.send([
            {
                cashaddr: r.getAddress(),
                value: 50000,
                unit: "satoshis",
            },
        ]);     
        
        //let tx = await r.broadcast(d.toChunks())
        let tx2 = await r.broadcast()
        expect(tx2.outputs[0]!.lockingBytecode).toStrictEqual(new Uint8Array(
            [
                106,   
                4,  98,  97, 110, 107,   
                1,  82,   
                1,  1,   
                2,   3,  82,   
                1,   1,  
                23,
                169, 20,
                228, 166, 133, 142, 156,  
                50,  186,  76, 216,  44, 
                200,  94,  39,  43, 228, 
                113,  71, 191, 226,  12,
                135
                
              ]
        ))
    });

    test("Should a serialize and broadcast a Divide contract and itself", async () => {
        let payees = [
            "bchtest:qregan4d575yu6vepkmg6qu0jhy4w568kqm2nu0gs6",
            "bchtest:qpm0fcekjj69fhcf7cl6gc8q4yx32k9vrsj7kug49q",
            "bchtest:qrgexapv88zs5f9y8xs9ksxkhjek6ndmpqr0s83fpv",
            "bchtest:qregan4d575yu6vepkmg6qu0jhy4w568kqm2nu0gs6",
            "bchtest:qpm0fcekjj69fhcf7cl6gc8q4yx32k9vrsj7kug49q",
            "bchtest:qrgexapv88zs5f9y8xs9ksxkhjek6ndmpqr0s83fpv"
          ]
        let options = {version:1, network:"regtest"}
        let d = new Divide(4000, payees, options)
        
        let r = new Record(850,0,options)
        // fund the contract
        const alice = await RegTestWallet.fromId(process.env['ALICE_ID']!);
        await alice.send([
            {
                cashaddr: r.getAddress(),
                value: 50000,
                unit: "satoshis",
            },
        ]);   

        let tx = await r.broadcast(d.toChunks())
        let aBin = new Uint8Array([106, 4, 98, 97, 110])

        let payload = new Uint8Array([107, 1, 68, 1, 1, 2, 15, 160, 25, 118, 169, 20, 242, 142, 206, 173, 167, 168, 78, 105, 153, 13, 182, 141, 3, 143, 149, 201, 87, 83, 71, 176, 136, 172, 25, 118, 169, 20, 118, 244, 227, 54, 148, 180, 84, 223, 9, 246, 63, 164, 96, 224, 169, 13, 21, 88, 172, 28, 136, 172, 25, 118, 169, 20, 209, 147, 116, 44, 57, 197, 10, 36, 164, 57, 160, 91, 64, 214, 188, 179, 109, 77, 187, 8, 136, 172, 25, 118, 169, 20, 242, 142, 206, 173, 167, 168, 78, 105, 153, 13, 182, 141])
        //expect(opCodeString).toEqual(a)
        expect(tx.outputs[0]!.lockingBytecode.slice(0,5)).toEqual(aBin)
        expect(tx.outputs[0]!.lockingBytecode.slice(5,107)).toEqual(payload)
        let tx2 = await r.broadcast()
        expect(tx2.outputs[0]!.lockingBytecode).toStrictEqual(new Uint8Array(
            [
                106,  
                4,  98,  97, 110, 107,   
                1,  82,   
                1,   1,   
                2,   3,  82,   
                1,   0,  
                23, 
                169, 20,
                150, 225, 153, 215, 234,  
                 35, 251, 119, 159,  87, 
                100, 185, 113, 150, 130, 
                 64,   2, 239, 129,  26,
                 135
              ]
        ))
    });


    

});