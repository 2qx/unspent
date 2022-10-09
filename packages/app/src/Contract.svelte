<script lang="ts">
    import { beforeUpdate } from 'svelte';
    import UtxosSelect from "./UtxosSelect.svelte";
    import { load } from "./machinery/loader-store";
	
    export let instance; 
    let balance = NaN;
    let txn = "";
    let utxos = []
    import { executorAddress } from './store.js';
  import Address from './Address.svelte';
	let executorAddressValue = "";
	
	executorAddress.subscribe(value => {
		executorAddressValue = value;
	});

    beforeUpdate(async () => {
        if(instance) balance = await instance.getBalance()
    });
    

    const execute = async () => {
        await load(
            {
                load: async () => {
                    txn = await instance.execute(executorAddressValue)
                },
            }
        )
    }


    const getUtxos = async () => {
        await load(
            {
                load: async () => {
                    utxos = await instance.getUtxos()
                    utxos = utxos.map( (u) => {u.key = u.txid +":"+u.vout; u.use =true ; return u})
                },
            }
        )
    }

    function dropUtxos(){
        utxos = []
    }

</script>

<div>
    {#if instance}
        <p>{instance.asText()}</p>
        <span id="flex-container">
            <span class="id-label">Address:</span>
            <span class="flex-middle"> <Address address={instance.getAddress()}></Address></span>
            <span class="id-whitespace"><b>{ balance } sats  </b></span>
        </span>
        <br>
        <span id="flex-container">
            <span class="id-label">Serialized:</span>
            <span class="fixed-tiny">{instance.toString()}</span>
            <span class="id-whitespace"></span>
        </span>
        <br>
        <span id="flex-container">
            <span class="id-label">Inputs:</span>
            <span class="flex-middle">
                {#if utxos.length==0}
                  <button on:click={getUtxos}>Select Inputs</button>
                {/if}
                {#if utxos.length>0}
                    <button on:click={dropUtxos}>Use All (default)</button>
                    <UtxosSelect bind:utxos={utxos}/>
                {/if}
            </span>
            <span class="id-whitespace"></span>
        </span>
        <br>
        <span id="flex-container">
            <span class="id-label"><button on:click={execute}>Submit</button></span>
            <span class="flex-middle">{ txn }</span>
            <span class="id-whitespace"></span>
        </span>
    {/if}
</div>

<style>
    #flex-container {
    display: flex;
    flex-direction: row;
    }
    .id-label {
        flex: 1;
    }
    .flex-middle {
        flex: 4;
    }
    .fixed-tiny {
        font-family: 'Courier New', Courier, monospace;
        font-size: small;
        word-break: break-word; 
        flex: 4;
    }
    .id-whitespace {
        flex: 2;
    }
</style>