<script>
	import { afterUpdate } from 'svelte';
	import makeBlockie from 'ethereum-blockies-base64';
	import { binToHex } from '@bitauth/libauth';
	import { opReturnToInstance } from '@unspent/phi';
	import { load } from '$lib/machinery/loader-store.js';
	import Contract from '$lib/Contract.svelte';
	import Address from '$lib/Address.svelte';
	export let data;
	let instance;

	const init = async () => {
		await load({
			load: async () => {
				instance = opReturnToInstance(data.opReturn);
				console.log(JSON.stringify(data));
			}
		});
	};

	function collapse() {
		instance = undefined;
	}

	afterUpdate(() => {
		onClick: async () => init();
	});
</script>

<table>
	<tr>
		<td class="icon">
			<img alt={data.lockingBytecode} src={makeBlockie(binToHex(data.lockingBytecode))} />
		</td>
		<td class="cashaddr">
			<Address address={data.address} />
			<br />
			<b>{data.name}</b><br />
			lock:{binToHex(data.lockingBytecode)}
		</td>
		<td class="loader">
			{#if !instance}
				<button on:click={init}> v </button>
			{/if}
			{#if instance}
				<button on:click={collapse}> ^ </button>
			{/if}
		</td>
	</tr>
</table>

{#if instance}
	<Contract bind:instance />
{/if}
<hr />

<style>
	.cashaddr {
		flex: auto;
		font-size: small;
	}

	.icon {
		width: 4rem;
	}
</style>
