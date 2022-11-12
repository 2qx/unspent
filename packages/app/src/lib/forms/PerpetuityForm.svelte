<script lang="ts">
	import { Perpetuity } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	export let contract;
	let isPublished = false;
	let showHelp = false;

	let period, receiptAddress, decay;
	let executorAllowance = 1200;
	function createContract() {
		try {
			contract = new Perpetuity(period, receiptAddress, executorAllowance, decay);
		} catch (e: Error) {
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
			<label for="decay">Decay:</label>
		</td>
		<td>
			<input type="number" on:change={() => createContract()} min="2" bind:value={decay} required />
		</td>
	</tr>
	{#if showHelp}
		<tr class="help"
			><td colspan="2">
				The fraction of inputs that should be sent each period. E.g. A decay of two (2) dispenses
				half (1/2) the total each time. A decay of 20 would release 1/20th the initial value.</td
			></tr
		>
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
				min="1000"
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

{#if !contract}
<button on:click={createContract}> Calculate Locking Script</button>
{/if}

<style>
	#table-1 {
		width: 100%;
	}
</style>
