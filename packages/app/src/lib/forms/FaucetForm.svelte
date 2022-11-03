<script lang="ts">
	import { Faucet } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	export let contract;

	let showHelp = false;

	let period = 1;
	let payout = 1200;
	let index = 1;

	function newIndex() {
		index = Math.floor(Math.random() * 100);
	}

	function createContract() {
		try {
			contract = new Faucet(period, payout, index);
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

<table>
	<tr>
		<td>
			<label for="payout">Payout (satoshis):</label>
		</td>
		<td>
			<input type="number" on:change={() => createContract()} bind:value={payout} required />
		</td>
	</tr>
	{#if showHelp}
		<tr class="help"><td colspan="2"> Amount contract will payout per period. </td></tr>
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
			<label for="index">Index:</label>
		</td>

		<td
			><input type="number" bind:value={index} on:change={() => createContract()} required /><button
				on:click={newIndex}
			>
				random
			</button></td
		>
	</tr>
	{#if showHelp}
		<tr class="help">
			<td colspan="2"> A value to make the faucet unique. </td>
		</tr>
	{/if}
</table>
<br />

<button on:click={createContract}> Calculate Locking Script</button>
