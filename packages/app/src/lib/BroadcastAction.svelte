<script lang="ts">
	import { beforeUpdate } from 'svelte';
  import { base } from "$app/paths";
	import { Confetti } from "svelte-confetti";
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
    if(!executedSuccess){
      await check();
    }
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
    isPublished = true
		executedSuccess = true;
	};
</script>


{#if executedSuccess}
  <Confetti colorRange={[75, 175]} />
{/if}
{#if isPublished == undefined}
	checking records ...
{:else if isPublished == true}
	<button disabled>Published</button>
  {#if txid}
  <a href="{base}/explorer?tx={txid}">{txid}</a>
  {/if}
{:else}
  <p>The following record has not been included in a block:</p>
	<button class="hit-me" id="opreturn" on:click={broadcast}>{opReturnHex}</button>
{/if}

<style>
	#opreturn {
		font-size: x-small;
	}
</style>
