<script lang="ts">
	import { Record } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	export let contract;

	let showHelp = false;

	let maxFee = 850;
	let index = 0;

	function newIndex() {
		index = Math.floor(Math.random() * 100);
	}

	function createContract() {
		try {
			contract = new Record(maxFee, index);
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
			<label for="payout">Max Fee (satoshis):</label>
		</td>
		<td>
			<input
				type="number"
				on:change={() => createContract()}
				bind:value={maxFee}
				min="600"
				required
			/>
		</td>
	</tr>
	{#if showHelp}
		<tr class="help"><td colspan="2"> Amount available to broadcast transaction. </td></tr>
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
