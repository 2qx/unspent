<script lang="ts">

    import { Record } from "@unspent/phi"
    import { load } from "./machinery/loader-store"
	
    export let instance; 
    let balance = NaN;
    let txn = "";
    import { executorAddress } from './store.js';
	let executorAddressValue = "";
	
	executorAddress.subscribe(value => {
		executorAddressValue = value;
	});

    const getBalance = async () => {
        await load(
            {
                load: async () => {
                    balance = await instance.getBalance()
                },
            }
        )
    }

    const execute = async () => {
        await load(
            {
                load: async () => {
                    txn = await instance.execute(executorAddressValue)
                },
            }
        )
    }


</script>

<div>
    {#if instance}
	  <p>{instance.toString()}</p>
	  <p>{instance.asText()}</p>
	  <p>{instance.getAddress()}</p>
      <p>Balance: { balance } sats  <button on:click={getBalance}>Update</button> </p>
      <p>{ txn } </p>  <button on:click={execute}>Call</button>
    {/if}
</div>
