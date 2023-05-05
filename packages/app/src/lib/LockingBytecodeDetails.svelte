<script lang="ts">
	import {
		instantiateSha256,
		hexToBin,
		lockingBytecodeToCashAddress,
		lockingBytecodeToBase58Address
	} from '@bitauth/libauth';
	import { getUnspentOutputs } from '@unspent/psi';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { load } from '$lib/machinery/loader-store.js';

	import Address from './Address.svelte';
	import AddressBlockie from './AddressBlockie.svelte';
	import { chaingraphHost } from '$lib/store.js';

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

	const loadTx = async () => {
		await load({
			load: async () => {
				const sha256Promise = instantiateSha256();
				results = (await getUnspentOutputs(chaingraphHostValue, lockingBytecode, network))
					.search_output;
				results = results.map((r) => {
					return {
						txid: r.transaction_hash.slice(2),
						vout: r.output_index,
						satoshis: r.value_satoshis
					};
				});
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

<AddressBlockie size={35} {lockingBytecode} />
{#if cashaddr}
	<p>Cashaddress: <Address address={cashaddr} /></p>
{/if}
{#if legacy}
	<p>Legacy:</p>
	<pre>{legacy}</pre>
{/if}

{#if lockingBytecode}
	<h3>Unspent Transaction Outputs</h3>
	{#if results}
		{#each results as txo}
			<div>
				<p>
					<a style="line-break:anywhere;" href="{base}/explorer?tx={txo.txid}">{txo.txid}</a
					>:{txo.vout}
				</p>
				<p>+&nbsp;{txo.satoshis}</p>
			</div>
		{/each}
	{/if}
{/if}
