<script lang="ts">
	import { Annuity } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	export let contract;
	let isPublished = false;
	let showHelp = false;

	let period, receiptAddress, installment;
	let executorAllowance = 1200;
	function createContract() {
		try {
			contract = new Annuity(period, receiptAddress, installment, executorAllowance);
		} catch (e: Error) {
			console.log(e);
			toast.push(e, { classes: ['warn'] });
		}
	}

	function toggleHelp() {
		showHelp = !showHelp;
	}
</script>

{#if !showHelp}
	<button class="help-button" on:click={toggleHelp}> Show Help </button>
{:else}
	<button on:click={toggleHelp}> Hide Help </button>
{/if}

<table id="table-1">
	<tr>
		<td>
			<label for="installment">Installment:</label>
		</td>
		<td>
			<input
				type="number"
				on:change={() => createContract()}
				min="543"
				bind:value={installment}
				required
			/>
		</td>
	</tr>
	{#if showHelp}
		<tr class="help"><td colspan="2"> Amount contract will payout per period. </td></tr>
	{/if}

	<tr>
		<td>
			<label for="receiptAddress">Receipt Address:</label>
		</td>
		<td id="table-1">
			<input
				type="text"
				bind:value={receiptAddress}
				on:change={() => createContract()}
				size="55"
				required
				placeholder="bitcoincash:q1a2s3d4f..."
			/><br />
		</td>
	</tr>
	{#if showHelp}
		<tr class="help">
			<td colspan="2"> The address to recieve a regular payout </td>
		</tr>
	{/if}

	<tr>
		<td>
			<label for="period">Period:</label>
		</td>
		<td>
			<input
				type="number"
				on:change={() => createContract()}
				required
				bind:value={period}
				min="1"
				placeholder="e.g. 1 block, ~10 minutes"
			/>
		</td>
	</tr>
	{#if showHelp}
		<tr class="help">
			<td colspan="2"> How often (in blocks) the contract can pay. </td>
		</tr>
	{/if}

	<tr>
		<td>
			<label for="executorAllowance">Executor Allowance:</label>
		</td>

		<td
			><input
				type="number"
				bind:value={executorAllowance}
				on:change={() => createContract()}
				min="543"
				max="12000"
				required
			/></td
		>
	</tr>
	{#if showHelp}
		<tr class="help">
			<td colspan="2"> Remainder for the execution of the contract and miner fees.</td>
		</tr>
	{/if}
</table>
<br />

<button on:click={createContract}> Calculate Locking Script</button>

<style>
	#table-1 {
		width: 100%;
	}
</style>
