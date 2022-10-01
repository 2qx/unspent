<script lang="ts">

    import {afterUpdate} from "svelte";
	import { getRecords, parseOpReturn } from "@unspent/phi";
    import { load } from "./machinery/loader-store"
	import { executorAddress } from './store.js';
	import ContractItem from "./ContractItem.svelte";
	import ContractInit from "./ContractInit.svelte";
	import Contract from "./Contract.svelte";
	let contractData = [];

	let protocol = "utxo";
	let host = 'https://demo.chaingraph.cash/v1/graphql';
    let node  = "bchn"
	let executorAddressValue = "";
	
	executorAddress.subscribe(value => {
		executorAddressValue = value;
	});

	function updateExAddress(){
		executorAddress.set(executorAddressValue)
	}


	const addContracts = async () => {
        await load(
            {
                load: async () => {

					let protocolHex = protocol.split('').map(el => el.charCodeAt(0).toString(16)).join('')
                    let contractHex = await getRecords(host, "6a04" + protocolHex, node)
					contractData = contractHex.map( x => 
					   parseOpReturn(x)
					)
                },
            }
        )
    }

    afterUpdate(() => {
                    onClick: async () => addContracts()
    })

</script>




<main>
	<div>

		<span>

			<h2>Settings</h2>
			Executor Address: <input on:change={updateExAddress} bind:value={executorAddressValue} style="width: 500px">
			<hr>
			Protocol: <input bind:value={protocol} style="width: 100px">
			Chaingraph: <input bind:value={host} style="width: 400px">
			Node: <input bind:value={node} style="width: 100px" >
			<hr>
			<h2>Records</h2>
			<button on:click={addContracts}>
				Load
			</button>
		</span>

	</div>

	<br/>

	<ul>
			<!-- open each block -->
				{#each contractData as cat (cat.opReturn)}
				<li>
					<ContractItem bind:data={cat}/>
				</li>
			{/each}
			<!-- close each block -->
		
	</ul>
	<hr>
	<Contract></Contract>
	<ContractInit></ContractInit>
</main>

<style>
</style>