<script>
	import { _, isLoading } from 'svelte-i18n';
	import UtxoSection from '$lib/UtxoSection.svelte';
	import { receiptAddressStore } from '$lib/store.js';

	let receiptAddress;
	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
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
	<UtxoSection {receiptAddress} />
{/if}
