<script lang="ts">
	import Contract from '$lib/Contract.svelte';
	import AnnuityForm from '$lib/forms/AnnuityForm.svelte';
	import DivideForm from '$lib/forms/DivideForm.svelte';
	import FaucetForm from '$lib/forms/FaucetForm.svelte';
	import PerpetuityForm from '$lib/forms/PerpetuityForm.svelte';
	import MineForm from '$lib/forms/MineForm.svelte';
	import RecordForm from '$lib/forms/RecordForm.svelte';

	export let instanceType: string;
	let contract;
</script>

<div>
	{#if instanceType == 'Annuity'}
		<AnnuityForm bind:contract />
	{:else if instanceType == 'Divide'}
		<DivideForm bind:contract />
	{:else if instanceType == 'Faucet'}
		<FaucetForm bind:contract />
	{:else if instanceType == 'Perpetuity'}
		<PerpetuityForm bind:contract />
	{:else if instanceType == 'Mine'}
		<MineForm bind:contract />
	{:else if instanceType == 'Record'}
		<RecordForm bind:contract />
	{:else}
		<p>Couldn't find contract form for {instanceType}</p>
	{/if}
	<br />

	{#if contract}
		<Contract bind:instance={contract} {instanceType} />
	{/if}
</div>
