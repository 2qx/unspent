<script lang="ts">
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import { Perpetuity, sanitizeAddress } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	export let contract;
	let isPublished = false;

	let period = NaN;
	let receiptAddress = '';
	let decay = NaN;
	let executorAllowance = 1200;
	async function createContract() {
		try {
			try {
				receiptAddress = await sanitizeAddress(receiptAddress);
			} catch (e: any) {
				if (e.message) {
					toast.push(e.message, { classes: ['warn'] });
				} else {
					toast.push(e, { classes: ['warn'] });
				}
			}
			contract = new Perpetuity(period, receiptAddress, executorAllowance, decay);
		} catch (e: Error) {
			contract = undefined;
			if (e.message) {
				toast.push(e.message, { classes: ['warn'] });
			} else {
				toast.push(e, { classes: ['warn'] });
			}
		}
	}
</script>

<div class="margins">
	<Textfield
		bind:value={receiptAddress}
		on:change={() => createContract()}
		style="width: 100%;"
		helperLine$style="width: 100%;"
		type="text"
		required
		label="Receipt Address"
	>
		<HelperText slot="helper">The address to recieve a regular payout.</HelperText>
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
		bind:value={decay}
		on:change={() => createContract()}
		type="number"
		input$min="2"
		required
		label="Decay"
	>
		<HelperText slot="helper"
			>The fraction of inputs that should be sent each period. E.g. A decay of two (2) dispenses
			half (1/2) the total each time. A decay of 20 would release 1/20th the value each period.</HelperText
		>
	</Textfield>

	<Textfield
		bind:value={executorAllowance}
		on:change={() => createContract()}
		type="number"
		input$min={Perpetuity.minAllowance}
		input$max="12000"
		required
		label="Executor Allowance"
	>
		<HelperText slot="helper"
			>Remainder for the execution of the contract and miner fees.</HelperText
		>
	</Textfield>
</div>
