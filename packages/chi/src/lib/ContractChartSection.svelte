<script>
	import { beforeUpdate } from 'svelte';
	import ContractChart from '$lib/ContractChart.svelte';
	import { Perpetuity } from '@unspent/phi';

	export let receiptAddress;
	let series = [];
	let contract;

	beforeUpdate(async () => {
		if (receiptAddress) {
			if (!contract) {
				contract = new Perpetuity(4383, receiptAddress, 1500, 96);
				if (contract) await loadSeries();
			}
		}
	});

	const loadSeries = async () => {
		series = await contract.asSeries();
	};
</script>

<section>
	{#if series && series.length > 0}
		{#each series as ts (ts.id)}
			<pre style="font-size:x-small;">{ts.id}</pre>
			<ContractChart bind:series={ts.data} />
		{/each}
	{:else if !receiptAddress}
		-
	{:else}
		<progress id="progress-bar" aria-label="Content loading…" />
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		line-break: normal;
	}
</style>
