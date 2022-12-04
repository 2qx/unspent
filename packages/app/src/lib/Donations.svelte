<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { load } from '$lib/machinery/loader-store.js';
	import { getUnspentOutputs } from '@unspent/phi';
	import Address from './Address.svelte';
	import ImageList, { Item, Image, Supporting, Label } from '@smui/image-list';
	import { chaingraphHost } from '$lib/store.js';
	import {
		instantiateSha256,
		hexToBin,
		lockingBytecodeToCashAddress,
		lockingBytecodeToBase58Address
	} from '@bitauth/libauth';
	import { browser } from '$app/environment';
	import { workerData } from 'worker_threads';

	export let lockingBytecode;
	let results;
	let cashaddr = '';
	let bytecodeDetails;
	let legacy = '';
	let chaingraphHostValue = '';

	chaingraphHost.subscribe((value) => {
		chaingraphHostValue = value;
	});

	onMount(async () => {
		if (chaingraphHostValue.length > 0) {
			loadTx();
		}
	});

	function getUnevenImageSize(
		counter: number,
		base: number,
		variance: number,
		preAdd = (num: number) => num
	) {
		const mid = (counter % 2 ? Math.cos : Math.sin)(counter) * variance;
		return base + Math.floor(preAdd(mid));
	}

	const loadTx = async () => {
		await load({
			load: async () => {
				const sha256Promise = instantiateSha256();
				results = (await getUnspentOutputs(chaingraphHostValue, lockingBytecode)).search_output;
				results = results.map((r) => {
					return {
						txid: r.transaction_hash.slice(2),
						vout: r.output_index,
						satoshis: r.value_satoshis
					};
				}).reverse();
				let cashaddrResponse = lockingBytecodeToCashAddress(
					hexToBin(lockingBytecode),
					'bitcoincash'
				);
				if (typeof cashaddrResponse === 'string') cashaddr = cashaddrResponse;
				const sha256 = await sha256Promise;
				let legacyResponse = lockingBytecodeToBase58Address(
					sha256,
					hexToBin(lockingBytecode),
					'mainnet'
				);
				if (typeof legacyResponse === 'string') legacy = legacyResponse;
			}
		});
	};
</script>

{#if cashaddr}
	<p>Cashaddress: <Address address={cashaddr} /></p>
  <p>If you have a privacy-centric browser, you may copy the cash address manually:</p>
	<pre>{cashaddr}</pre>
{/if}
{#if legacy}
	<p>Legacy Address:</p>
	<pre>{legacy}</pre>
{/if}

{#if lockingBytecode}
	<h3>Donations so far...</h3>
	{#if results}
		<ImageList class="my-image-list-masonry" style="min-height:1000px;" masonry>
			{#each results as txo}
				<Item>
					<div class="tract" style="height:{getUnevenImageSize(txo.satoshis, 80, 120, Math.abs)}px">
						<h2>🍊 {txo.satoshis.toLocaleString()}</h2>
						<a target=_blank href="https://explorer.bitcoinunlimited.info/tx/{txo.txid}" >Transaction</a>
					</div>
				</Item>
			{/each}
		</ImageList>
	{/if}
{/if}

<style>
	.tract {
		align-items: center;
		background: rgb(207, 237, 250);
		border-radius: 30px;
		padding: 10px;
	}
	.tract h2 {
		font-weight: 600;
		color: rgb(148, 87, 1);
    text-align: right;
	}
  .tract a {
		font-weight: 400;
		color: rgb(148, 87, 1);
    
	}

</style>
