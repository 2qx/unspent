<script lang="ts">
	import { onMount } from 'svelte';
	import { load } from '$lib/machinery/loader-store.js';
	import { getLockingBytecode } from '@unspent/phi';
	import AddressBlockie from './AddressBlockie.svelte';
	import { chaingraphHost } from '$lib/store.js';
	import { resourceLimits } from 'worker_threads';

	export let lockingBytecode;
	let results;
	let chaingraphHostValue = '';

	chaingraphHost.subscribe((value) => {
		chaingraphHostValue = value;
	});

	onMount(async () => {
		if (chaingraphHostValue.length > 0) {
			loadTx();
		}
	});

	const loadTx = async () => {
		await load({
			load: async () => {
				results = (await getLockingBytecode(chaingraphHostValue, lockingBytecode)).search_output;
        
			}
		});
	};
</script>

{#if lockingBytecode}
	<AddressBlockie {lockingBytecode} />
	{#if results}
		{#each results as txo}
			<div>
				<b>{txo.value_satoshis}</b>
				{#if txo.spent_by.length > 0}
					{#each txo.spent_by as spent}
						{spent.transaction.hash}{spent.input_index}
					{/each}
				{/if}
			</div>
		{/each}
	{/if}
	<pre>
	{JSON.stringify(results, undefined, 2)}
</pre>
{/if}
