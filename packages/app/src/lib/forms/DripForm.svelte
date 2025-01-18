<script lang="ts">
	import Icon from '@smui/textfield/icon';
	import Fab, { Icon as FabIcon } from '@smui/fab';
	import { Svg } from '@smui/common';
	import { mdiShuffle } from '@mdi/js';

	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import { Drip } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import type { Network } from 'cashscript';

	export let network: Network;
	export let version: number;
	export let contract;
	let options = { network: network, version: version };

	let showHelp = false;

	function newIndex() {
		createContract();
	}

	function createContract() {
		try {
			contract = new Drip(options);
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
	<p>
		A drip mine contract allows miners to collect Miner Extractable Sats as extra fees every block.
	</p>

</div>
