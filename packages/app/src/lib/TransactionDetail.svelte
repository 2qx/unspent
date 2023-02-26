<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { binToHex, binToBigIntUint64LE } from '@bitauth/libauth';
	import { bytecodeToAsm } from '@cashscript/utils';
	import List, { Item, Graphic, Meta, Text, PrimaryText, SecondaryText } from '@smui/list';
	import { hexToBin, decodeTransaction } from '@bitauth/libauth';
	import { getTransaction } from '@unspent/phi';

	import AddressBlockie from './AddressBlockie.svelte';
	import { load } from '$lib/machinery/loader-store.js';

	import { chaingraphHost } from '$lib/store.js';

	export let txid;
	let transaction;
	let txObject;
	let outputs;
	let inputs;
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
				transaction = (await getTransaction(chaingraphHostValue, txid))['transaction'].pop();
				txObject = decodeTransaction(hexToBin(transaction.encoded_hex));
				if (typeof txObject === 'string') throw Error(txObject);
				outputs = txObject.outputs.map((o) => {
					return {
						lockingBytecode: binToHex(o.lockingBytecode),
						satoshis: binToBigIntUint64LE(o.satoshis)
					};
				});
				inputs = txObject.inputs.map((i) => {
					const asm = bytecodeToAsm(i.unlockingBytecode);
					return {
						asm: asm,
						vout: i.outpointIndex,
						outpointTransactionHash: binToHex(i.outpointTransactionHash)
					};
				});
			}
		});
	};
</script>

{#if txObject && transaction}
	{#if transaction.block_inclusions.length >= 1}
		<p>block: {transaction.block_inclusions[0].block.height}</p>
	{:else}
		<p>Unconfirmed</p>
	{/if}

	<p>version: {transaction.version}</p>
	<p>size: {transaction.size_bytes}</p>
	<p>locktime: {transaction.locktime}</p>

	<p>fee: {transaction.fee_satoshis}</p>
	<h3>Inputs:</h3>
	<p>Input Total Value: {transaction.input_value_satoshis}</p>
	{#if inputs}
		{#each inputs as i}
			<p>asm:</p>
			<pre>{i.asm}</pre>
			<p>
				outpoint:<a
					style="line-break:anywhere;"
					href="{base}/explorer?tx={i.outpointTransactionHash}">{i.outpointTransactionHash}</a
				>
			</p>
			<p>vout:{i.vout}</p>
		{/each}
	{/if}
	{#if outputs}
		<h3>Outputs:</h3>
		{#each outputs as o}
			<AddressBlockie size={40} lockingBytecode={o.lockingBytecode} />
			<p>
				<a style="line-break:anywhere;" href="{base}/explorer?lockingBytecode={o.lockingBytecode}"
					>{o.lockingBytecode}</a
				>
			</p>
			<p>+&nbsp;{o.satoshis}</p>
		{/each}
	{/if}
{/if}
