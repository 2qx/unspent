<script lang="ts">
	import Select, { Option } from '@smui/select';
	import ContractSwitch from '$lib/ContractSwitch.svelte';
	let selected: any;
	export let instanceType;

	let contractTypes = [
		{ id: 'A', name: 'Annuity' },
		{ id: 'D', name: 'Divide' },
		{ id: 'F', name: 'Faucet' },
		//{ id: "L", name: 'Lock' },
		//{ id: 'M', name: 'Mine' },
		{ id: 'P', name: 'Perpetuity' },
		{ id: 'R', name: 'Record' }
	];
</script>

<Select
	key={(c) => `${c ? c.name : ''}`}
	on:MDCSelect:change={(e) => (instanceType = e.detail.value.name)}
	bind:value={selected}
	label="Contract Type"
>
	{#each contractTypes as c (c.name)}
		<Option value={c}>{c.name}</Option>
	{/each}
</Select>

<br />

{#if instanceType}
	<ContractSwitch bind:instanceType />
{/if}
