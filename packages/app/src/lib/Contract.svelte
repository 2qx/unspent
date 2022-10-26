<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import BroadcastAction from '$lib/BroadcastAction.svelte';
	import UtxosSelect from '$lib/UtxosSelect.svelte';
	import { load } from '$lib/machinery/loader-store.js';
	import { executorAddress } from './store.js';
	import Address from './Address.svelte';
	import SerializedString from './SerializedString.svelte';
	export let instance: any;
	export let instanceType = '';
	let balance = NaN;
	let txn = '';
	let opReturnHex = '';
	let utxos:any = [];
	let isFunded = false;

	let executorAddressValue = '';

	executorAddress.subscribe((value) => {
		executorAddressValue = value;
	});

	beforeUpdate(async () => {
		// This fixes a bug related to the contract switch where old contracts appear
		if (instanceType && instanceType !== instance.artifact.contractName) instance = undefined;
		await updateBalance();
	});

	const updateBalance = async () => {
		await load({
			load: async () => {
				if (instance) balance = await instance.getBalance();
				if (balance > 0) isFunded = true;
			}
		});
	};

	const execute = async () => {
		await load({
			load: async () => {
				txn = await instance.execute(executorAddressValue, undefined, utxos);
			}
		});
	};

	const getUtxos = async () => {
		await load({
			load: async () => {
				utxos = await instance.getUtxos();
				utxos = utxos.map((u:any) => {
					u.key = u.txid + ':' + u.vout;
					u.use = true;
					return u;
				});
			}
		});
	};

	function dropUtxos() {
		utxos = [];
	}
</script>

<div>
	{#if instance}
		<p>{instance.asText()}</p>
		<table>
			<tr>
				<td class="id-label">Record:</td>
				<td class="flex-middle"
					><BroadcastAction opReturnHex={instance.toOpReturn(true)}>Broadcast</BroadcastAction></td
				>
			</tr>
			<tr>
				<td class="id-label">Address:</td>
				<td class="flex-middle"> <Address address={instance.getAddress()} /></td>
			</tr>
			<tr>
				<td class="id-label">String:</td>
				<td class="flex-middle"><SerializedString str={instance.toString()} /></td>
			</tr>
			<tr>
				<td class="id-label">Balance:</td>
				<td class="flex-middle">{balance} sats <button on:click={updateBalance}>Update</button></td>
			</tr>
			{#if isFunded}
				<tr>
					<td class="id-label">Inputs:</td>
					<td class="flex-middle">
						{#if utxos.length == 0}
							<button on:click={getUtxos}>Select Inputs</button>
						{/if}
						{#if utxos.length > 0}
							<button on:click={dropUtxos}>Use All Unspent Outputs (default)</button>
							<UtxosSelect bind:utxos />
						{/if}
					</td>
				</tr>
				<tr>
					<td class="id-label"><button on:click={execute}>Unlock</button></td>
					<td class="flex-middle">{txn}</td>
				</tr>
			{/if}
		</table>
	{/if}
</div>

<style>
	.id-label {
		width: 100px;
	}
	.flex-middle {
		font-style: normal;
		word-break: break-all;
	}
</style>