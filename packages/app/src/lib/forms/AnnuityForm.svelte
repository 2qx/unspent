<script lang="ts">
	import { Annuity } from '@unspent/phi';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';

	import { toast } from '@zerodevx/svelte-toast';
	export let contract;
	let isPublished = false;
	let showHelp = false;

	let period = NaN;
  let receiptAddress = "";
  let installment = NaN;
	let executorAllowance = 1200;
	function createContract() {
		if (receiptAddress && installment && period) {
			try {
				contract = new Annuity(period, receiptAddress, installment, executorAllowance);
			} catch (e: Error) {
				console.log(e);
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
  required
  label="Period"
>
  <HelperText slot="helper"> How often (in blocks) the contract can pay. e.g. 1 block, ~10 minutes.</HelperText>
</Textfield>

	<Textfield
		bind:value={installment}
		on:change={() => createContract()}
		type="number"
		input$min="543"
		required
		label="Installment"
	>
		<HelperText slot="helper">Amount contract will payout per period.</HelperText>
	</Textfield>

	
	<Textfield
		bind:value={executorAllowance}
		on:change={() => createContract()}
		type="number"
		min="543"
		max="12000"
		required
		label="Executor Allowance"
	>
		<HelperText slot="helper"
			>Remainder for the execution of the contract and miner fees.</HelperText
		>
	</Textfield>
</div>

{#if !contract}
	<button on:click={createContract}> Calculate Locking Script</button>
{/if}


