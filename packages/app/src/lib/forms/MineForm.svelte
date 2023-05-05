<script lang="ts">
	import Tooltip, { Wrapper } from '@smui/tooltip';
	import Fab, { Icon } from '@smui/fab';
	import { Svg } from '@smui/common';
	import { mdiShuffle } from '@mdi/js';

	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import { Mine, DUST_UTXO_THRESHOLD } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	import { binToHex } from '@bitauth/libauth';
	import { onMount } from 'svelte';
	import type { Network } from 'cashscript';

	export let network: Network;
	export let version: number;
	export let contract;
	let options = { network: network, version: version };
	let period = 1;
	let payout = 5000;
	let difficulty = 3;

	let canary = new Uint8Array(7);
	crypto.getRandomValues(canary);
	let canaryHex = binToHex(canary);

	function createContract() {
		try {
			contract = new Mine(period, payout, difficulty, canaryHex, options);
		} catch (e: any) {
			contract = undefined;
			if (e.message) {
				toast.push(e.message, { classes: ['warn'] });
			} else {
				toast.push(e, { classes: ['warn'] });
			}
		}
	}

	function newNonce() {
		crypto.getRandomValues(canary);
		canaryHex = binToHex(canary);
		createContract();
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
		input$min={Mine.minPayout}
		required
		label="Payout (satoshis)"
	>
		<HelperText slot="helper">Amount contract will payout per period.</HelperText>
	</Textfield>

	<Textfield
		on:change={() => createContract()}
		type="number"
		bind:value={difficulty}
		required
		min="1"
		max="5"
		label="Difficulty"
	>
		<HelperText slot="helper"
			>How many zeros should the solution require. Hint: three is somewhat hard for a browser, one
			is trival, five is probably too hard.</HelperText
		>
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

	<Textfield bind:value={canaryHex} disabled label="Canary">
		<HelperText slot="helper">A random value to begin the covenant from.</HelperText>
	</Textfield>

	<Wrapper>
		<Fab on:click={newNonce}>
			<Icon component={Svg} viewBox="2 2 20 20">
				<path fill="currentColor" d={mdiShuffle} />
			</Icon>
		</Fab>
		<Tooltip>Random Nonce.</Tooltip>
	</Wrapper>
</div>
