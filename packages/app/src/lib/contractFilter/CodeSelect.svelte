<script lang="ts">
	import Select, { Option } from '@smui/select';

	import { createEventDispatcher } from 'svelte';

	type Contract = { id: string; label: string };
	let fruits: Contract[] = [
		{ id: 'A', label: 'Annuity' },
		{ id: 'D', label: 'Divide' },
		{ id: 'F', label: 'Faucet' },
		{ id: 'M', label: 'Mine' },
		{ id: 'P', label: 'Perpetuity' },
		{ id: 'R', label: 'Record' }
	];

	export let value: string | null = null;

	const dispatch = createEventDispatcher();

	function handleChange() {
		dispatch('codeChange', {
			text: value
		});
	}
</script>

<div class="columns margins" style="justify-content: flex-start;">
	<div>
		<Select 
    style="width: 140px"
    key={(fruit) => `${fruit ? fruit.id : ''}`} 
    on:MDCSelect:change={handleChange}
    bind:value 
    label="Type">
			<Option value={null} />
			{#each fruits as fruit (fruit.label)}
				<Option value={fruit.id}>{fruit.label}</Option>
			{/each}
		</Select>
	</div>
</div>
