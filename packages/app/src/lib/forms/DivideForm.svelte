<script lang="ts">
	import { mdiPlus } from '@mdi/js';
	import Fab, { Icon } from '@smui/fab';
	import { Svg } from '@smui/common';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import AddressOptional from '$lib/AddressOptional.svelte';
	import { Divide, sanitizeAddress } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	export let contract;
	let isPublished = false;

	let payees: string[] = ['', ''];
	let executorAllowance = 1200;
	async function createContract() {
		try {
			let addresses = payees.map(async (a) => await sanitizeAddress(a));
			await Promise.all(addresses).then((addresses) => {
				contract = new Divide(executorAllowance, addresses);
			});
		} catch (e: Error) {
			contract = undefined;
			if (e.message) {
				toast.push(e.message, { classes: ['warn'] });
			} else {
				toast.push(e, { classes: ['warn'] });
			}
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

	function handleMsg(event) {
		console.log(event.detail);
		if (event.detail.addressIdx && payees.length > 2) {
			payees.splice(event.detail.addressIdx, 1);
			payees = payees;
			createContract();
		} else if (payees.length < 2) {
			toast.push('Minimum of two addresses required.');
		}
		createContract();
	}
</script>

<div class="margins">
	<Textfield
		bind:value={executorAllowance}
		on:change={() => createContract()}
		type="number"
		input$min={Divide.minAllowance + 66 * payees.length}
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
			on:message={handleMsg}
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
