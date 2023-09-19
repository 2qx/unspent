<script>
	import { beforeUpdate } from 'svelte';
	import { Perpetuity } from '@unspent/phi';
	import { receiptAddressStore } from '$lib/store.js';

	let receiptAddress = '';
	let utxos = [];
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
		utxos = await contract.getUtxos();
		console.log(JSON.stringify(utxos));
	};
</script>

{#if utxos && utxos.length > 0}
	{#each utxos as op}
		<p><b>{op.satoshis.toLocaleString()}</b></p>
		<pre>{op.height}</pre>
		<pre>{op.txid}:{op.vout}</pre>
	{/each}
{:else}
	<progress id="progress-bar" aria-label="Content loading…" />
{/if}
