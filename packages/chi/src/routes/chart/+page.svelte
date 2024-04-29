<script>
	import { _, isLoading } from 'svelte-i18n';
	import { receiptAddressStore, stateStore } from '$lib/store.js';
	import ContractChartSection from '$lib/ContractChartSection.svelte';

	let receiptAddress = '';
	let stateValue;
	let series = [];
	let contract;

	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
	});

	stateStore.subscribe((value) => {
		stateValue = Number(value);
		if (stateValue < 5) {
			stateStore.set('5');
		}
	});
</script>

{#if $isLoading}
	...
{:else if !receiptAddress}
<h1>
	{$_('8')}
</h1>
<a href="/">
	<img width="100%" src="/h/09.svg" alt={$_('8')} />
</a>
{:else}
	<ContractChartSection {receiptAddress} />
{/if}
