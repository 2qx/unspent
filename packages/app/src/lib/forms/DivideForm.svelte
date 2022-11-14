<script lang="ts">
  import { mdiPlus } from '@mdi/js';
  import Fab, { Icon } from '@smui/fab';
  import { Svg } from '@smui/common';
 	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import AddressOptional from '$lib/AddressOptional.svelte';
	import { Divide } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	export let contract;
	let isPublished = false;

	let payees: string[] = ['', ''];
	let executorAllowance = 1200;
	function createContract() {
		try {
			contract = new Divide(executorAllowance, payees);
		} catch (e: Error) {
			toast.push(e, { classes: ['warn'] });
		}
	}

	function addPayee() {
		if (payees.length < 4) {
			payees.push('');
			payees = payees;
		} else {
			toast.push('Maximum of four (4) addresses.');
		}
	}

	function handleRemoval(event) {
		if (payees.length > 2) {
			payees.splice(event.detail.addressIdx, 1);
			payees = payees;
		} else {
			toast.push('Minimum of two addresses required.');
		}
	}


</script>

<div class="margins">

<Textfield
  bind:value={executorAllowance}
  on:change={() => createContract()}
  type="number"
  input$min="543"
  input$max="12000"
  required
  label="Executor Allowance"
>
  <HelperText slot="helper"
    >Remainder for the execution of the contract and miner fees.</HelperText
  >
</Textfield>

{#each payees as payee, i}
  <AddressOptional
    bind:address={payee}
    index={i}
    on:message={handleRemoval}
    on:change={() => createContract()}
  />
{/each}
{#if payees.length < 4}
  <Fab on:click={addPayee}>
    <Icon component={Svg} viewBox="2 2 20 20">
      <path fill="currentColor" d={mdiPlus} />
    </Icon>
  </Fab>
{/if}

</div>