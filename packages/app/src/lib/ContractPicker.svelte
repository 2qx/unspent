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
		{ id: 'M', name: 'Mine' },
		{ id: 'P', name: 'Perpetuity' },
		{ id: 'R', name: 'Record' }
	];
</script>

<Select 
key={(c) => `${c ? c.name : ''}`}
on:MDCSelect:change={(e) => (instanceType = e.detail.value.name)}
bind:value={selected}  label="Contact Type">
  {#each contractTypes as c (c.name)}
    <Option value={c}>{c.name} </Option>
  {/each}
</Select>

<!-- this wan't so bad -->
<!--
  <select bind:value={selected} on:change={() => (instanceType = selected.name)}>
	<option value="" disabled selected>Select a Contact Type</option>
	{#each contractTypes as c (c.id)}
		<option value={c}>
			{c.name}
		</option>
	{/each}
</select> 
-->
<br>

{#if instanceType}
	<ContractSwitch bind:instanceType />
{/if}
