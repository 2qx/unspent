<script>
	import { beforeUpdate } from 'svelte';
	import { _, isLoading } from 'svelte-i18n';
	import { Perpetuity } from '@unspent/phi';
	import { receiptAddressStore } from '$lib/store.js';

	let receiptAddress = '';
	let series = [];
	let contract;

	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
	});

	beforeUpdate(async () => {
		if (receiptAddress) {
			contract = new Perpetuity(4383, receiptAddress, 1500, 96);
			if (contract) await loadSeries();
		}
	});

	const loadSeries = async () => {
		series = await contract.asSeries();
	};
</script>

{#if $isLoading}
	...
{:else if series && series.length > 0}
	{#each series as ts (ts.id)}
		<pre style="font-size:x-small;">{ts.id}</pre>
		{ts.data}
	{/each}
{:else}
	<h1>
		{$_('8')}
	</h1>
	<a href="/">
		<img width="100%" src="/h/09.svg" alt={$_('8')} />
	</a>
{/if}
