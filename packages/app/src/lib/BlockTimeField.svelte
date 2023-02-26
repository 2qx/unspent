<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import Select, { Option } from '@smui/select';
	import Chip, { Set, Text } from '@smui/chips';

	const dispatch = createEventDispatcher();

	let timeText = '';
	let interval = 1;
	export let blockTime = NaN;
	let selected = 'blocks';
	let choices = ['minutes', 'blocks', 'days', 'weeks', 'months'];

	function onChangeFn() {
		switch (selected) {
			case 'minutes':
				blockTime = Math.floor(interval / 10);
				break;
			case 'blocks':
				blockTime = interval;
				break;
			case 'days':
				blockTime = interval * 144;
				break;
			case 'weeks':
				blockTime = interval * 144 * 7;
				break;
			case 'months':
				blockTime = Math.floor(interval * 144 * 7 * 4.3333);
				break;
			default:
				break;
		}
	}
	dispatch('message', {
		period: blockTime
	});
</script>

<Textfield bind:value={interval} type="number" required label="Period">
	<HelperText slot="helper">
		How often (in blocks) the contract can pay. e.g. 1 block, ~10 minutes.</HelperText
	>
</Textfield>
<div>
	<Select on:MDCSelect:change={() => onChangeFn()} bind:value={selected} label="Time Unit">
		{#each choices as choice}
			<Option value={choice}>{choice}</Option>
		{/each}
	</Select>

	<pre class="status">Selected: {selected}</pre>
</div>

<Set chips={choices} let:chip choice bind:selected>
	<Chip on:click={() => onChangeFn()} {chip}>
		<Text>{chip}</Text>
	</Chip>
</Set>
<p>{blockTime} blocks, {interval} interval</p>
