<script lang="ts">
	import Icon from '@smui/textfield/icon';
	import Fab, { Icon as FabIcon } from '@smui/fab';
	import { Svg } from '@smui/common';
	import { mdiShuffle } from '@mdi/js';

	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import { Faucet } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	export let contract;

	let showHelp = false;

	let period = 1;
	let payout = 1200;
	let index = 1;

	function newIndex() {
		index = Math.floor(Math.random() * 100);
		createContract();
	}

	function createContract() {
		try {
			contract = new Faucet(period, payout, index);
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

<div class="margins">
	<Textfield
		bind:value={payout}
		on:change={() => createContract()}
		type="number"
		input$min={Faucet.minPayout}
		required
		label="Payout (satoshis)"
	>
		<HelperText slot="helper">Amount contract will payout per period.</HelperText>
	</Textfield>

	<Textfield
		bind:value={period}
		on:change={() => createContract()}
		type="number"
		input$min="1"
		input$max="65535"
		required
		label="Period"
	>
		<HelperText slot="helper">
			How often (in blocks) the contract can pay. e.g. 1 block, ~10 minutes.</HelperText
		>
	</Textfield>

	<Textfield
		bind:value={index}
		on:change={() => createContract()}
		type="number"
		min="0"
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

	<!-- <Wrapper>
	<Fab on:click={newIndex}>
		<Icon component={Svg} viewBox="2 2 20 20">
			<path fill="currentColor" d={mdiShuffle} />
		</Icon>
	</Fab>
	<Tooltip>Random Index.</Tooltip>
</Wrapper> -->
</div>
