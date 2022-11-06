<script lang="ts">

	import ContractSwitch from '$lib/ContractSwitch.svelte';
	let selected: any;
	export let instanceType;

	let contractTypes = [
		{ id: 'A', name: 'Annuity' },
		{ id: 'D', name: 'Divide' },
		{ id: 'F', name: 'Faucet' },
		//{ id: "L", name: 'Lock' },
		{ id: 'M', name: 'Mine' },
		{ id: 'P', name: 'Perpetuity' },
		{ id: 'R', name: 'Record' }
	];
</script>

<select bind:value={selected} on:change={() => (instanceType = selected.name)}>
	<option value="" disabled selected>Select a Contact Type</option>
	{#each contractTypes as c (c.id)}
		<option value={c}>
			{c.name}
		</option>
	{/each}
</select>

{#if instanceType}
	<ContractSwitch bind:instanceType />
{/if}
