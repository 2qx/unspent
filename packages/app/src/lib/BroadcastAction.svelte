<script lang="ts">
	import { beforeUpdate } from 'svelte';
  import { base } from "$app/paths";
	import { confetti } from '@neoconfetti/svelte';
	import { load } from '$lib/machinery/loader-store.js';
	import { getRecords, Record } from '@unspent/phi';
	import { chaingraphHost, node } from '$lib/store.js';

	export let opReturnHex: string;

	let isPublished: boolean;
	let executedSuccess = false;
	let txid = '';

	let chaingraphHostValue = '';
	let nodeValue = '';

	chaingraphHost.subscribe((value) => {
		chaingraphHostValue = value;
	});
	node.subscribe((value) => {
		nodeValue = value;
	});

	beforeUpdate(async () => {
		executedSuccess = false;
		await check();
	});

	const check = async () => {
		await load({
			load: async () => {
				if (opReturnHex.length > 0) {
					let queryHex = opReturnHex.length > 50 ? opReturnHex.slice(0, 50) : opReturnHex;
					let records = await getRecords(chaingraphHostValue, queryHex, nodeValue);
					isPublished = records.length > 0 ? true : false;
				}
			}
		});
	};
	const broadcast = async () => {
		let r = new Record();
		txid = await r.broadcast(opReturnHex);
		executedSuccess = true;
	};
</script>

{#if executedSuccess}
	<div>
		<div use:confetti />
	</div>
{/if}

{#if isPublished == undefined}
	checking records ...
{:else if isPublished == true}
	<button disabled>Published</button>
  <a href="{base}/tx/{txid}">tx</a>
{:else}
	<button class="hit-me" id="opreturn" on:click={broadcast}>{opReturnHex}</button>
{/if}

<style>
	#opreturn {
		font-size: xx-small;
	}
</style>
