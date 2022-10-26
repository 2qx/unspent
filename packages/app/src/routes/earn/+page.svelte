<script>
	import { load } from "$lib/machinery/loader-store.js"
	import { getRecords, parseOpReturn } from "@unspent/phi";
	import ContractItem from "$lib/ContractItem.svelte";
	import { protocol, chaingraphHost, node } from '$lib/store.js';
    let contractData = [];

	let protocolValue = '';
	let chaingraphHostValue = '';
	let nodeValue = '';

	protocol.subscribe((value) => {protocolValue = value});
	chaingraphHost.subscribe((value) => {chaingraphHostValue = value});
	node.subscribe((value) => {nodeValue = value});

	const addContracts = async () => {
        await load(
            {
                load: async () => {

					let protocolHex = protocolValue.split('').map(el => el.charCodeAt(0).toString(16)).join('')
                    let contractHex = await getRecords(chaingraphHostValue, "6a04" + protocolHex, nodeValue)
					contractData = contractHex.map( x => 
					   parseOpReturn(x)
					)
                },
            }
        )
    }
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Unspent app" />
</svelte:head>

<section>
	{#if chaingraphHostValue.length == 0}
	No Chaingraph endpoint specified.
	{/if}
	{#if contractData.length == 0}
	<button on:click={addContracts}>
		Load Contracts
	</button>
	{/if}
	<ul class="no-bullets">
		{#each contractData as cat (cat.opReturn)}
			<li>
				<ContractItem bind:data={cat}/>
			</li>
		{/each}
    </ul>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
li{
	list-style: none;
}

</style>
