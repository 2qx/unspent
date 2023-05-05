<script lang="ts">
	import Contract from '$lib/Contract.svelte';
	import AnnuityForm from '$lib/forms/AnnuityForm.svelte';
	import DivideForm from '$lib/forms/DivideForm.svelte';
	import FaucetForm from '$lib/forms/FaucetForm.svelte';
	import PerpetuityForm from '$lib/forms/PerpetuityForm.svelte';
	import MineForm from '$lib/forms/MineForm.svelte';
	import RecordForm from '$lib/forms/RecordForm.svelte';

  import {node } from "$lib/store.js";
	import { Network } from 'cashscript';
	
  export let instanceType: string;

	let contract :any;
  let nodeValue: Network;
  let version = 1;

  node.subscribe((value) => {
		nodeValue = value? value: Network.MAINNET;
	});
</script>

<div>
	{#if instanceType == 'Annuity'}
		<AnnuityForm bind:contract bind:network={nodeValue} bind:version={version}/>
	{:else if instanceType == 'Divide'}
		<DivideForm bind:contract bind:network={nodeValue} bind:version={version}/>
	{:else if instanceType == 'Faucet'}
		<FaucetForm bind:contract bind:network={nodeValue} bind:version={version}/>
	{:else if instanceType == 'Perpetuity'}
		<PerpetuityForm bind:contract bind:network={nodeValue} bind:version={version}/>
	{:else if instanceType == 'Mine'}
		<MineForm bind:contract bind:network={nodeValue} bind:version={version}/>
	{:else if instanceType == 'Record'}
		<RecordForm bind:contract bind:network={nodeValue} bind:version={version}/>
	{:else}
		<p>Couldn't find contract form for {instanceType}</p>
	{/if}
	<br />

	{#if contract}
		<Contract bind:instance={contract} {instanceType} />
	{/if}
</div>
