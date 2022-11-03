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

<div id="flex-container">
	<span class="icon">
		<img alt={data.lockingBytecode} src={makeBlockie(binToHex(data.lockingBytecode))} />
	</span>
	<span class="cashaddr">
		<Address address={data.address} />
		{data.name}
		{data.options.version}
	</span>
	<span class="loader">
		{#if !instance}
			<button on:click={init}> v </button>
		{/if}
		{#if instance}
			<button on:click={collapse}> ^ </button>
		{/if}
	</span>
</div>

{#if instance}
	<Contract bind:instance />
{/if}
<hr />

<style>
	#flex-container {
		display: flex;
		flex-direction: row;
	}

	#flex-container > .loader {
	}

	#flex-container > .cashaddr {
		flex: auto;
		font-size: small;
	}

	#flex-container > .icon {
		width: 6rem;
	}
</style>
