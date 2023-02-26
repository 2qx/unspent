<script lang="ts">
	import Icon from '@smui/textfield/icon';
	import Fab, { Icon as FabIcon } from '@smui/fab';
	import { Svg } from '@smui/common';
	import { mdiShuffle } from '@mdi/js';

	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import { Record, DUST_UTXO_THRESHOLD } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	export let contract;

	let showHelp = false;

	let maxFee = 850;
	let index = 0;

	function newIndex() {
		index = Math.floor(Math.random() * 100);
		createContract();
	}

	function createContract() {
		try {
			contract = new Record(maxFee, index);
		} catch (e: Error) {
			contract = undefined;
			if (e.message) {
				toast.push(e.message, { classes: ['warn'] });
			} else {
				toast.push(e, { classes: ['warn'] });
			}
		}
	}

	onMount(async () => {
		createContract();
	});
</script>

<div class="columns margins">
	<Textfield
		bind:value={maxFee}
		on:change={() => createContract()}
		type="number"
		input$min={Record.minMaxFee}
		required
		label="Max Fee (satoshis)"
	>
		<HelperText slot="helper">Amount available to broadcast transaction.</HelperText>
	</Textfield>

	<Textfield
		bind:value={index}
		on:change={() => createContract()}
		type="number"
		input$min="0"
		required
		label="Index"
	>
		<HelperText slot="helper">A value to make the contract unique.</HelperText>
		<Icon class="material-icons" tabindex="0" slot="trailingIcon">
			<Fab on:click={newIndex}>
				<FabIcon component={Svg} viewBox="2 2 20 20">
					<path d={mdiShuffle} />
				</FabIcon>
			</Fab>
		</Icon>
	</Textfield>
</div>
