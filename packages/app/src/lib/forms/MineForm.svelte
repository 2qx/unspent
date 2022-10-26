<script lang="ts">
	import { Mine } from '@unspent/phi';
    import { toast } from '@zerodevx/svelte-toast';
	import { binToHex } from '@bitauth/libauth';

	export let contract;

	let showHelp = false;

	let period = 1;
	let payout = 5000;
	let difficulty = 3;

	let canary = new Uint8Array(7);
	crypto.getRandomValues(canary);
	let canaryHex = binToHex(canary);

	function createContract() {
        try{
            contract = new Mine(period, payout, difficulty, canary);
		}catch (e:Error){
			toast.push(e, { classes: ['warn'] })
		}
	}

	function toggleHelp() {
		showHelp = !showHelp;
	}

	function newNonce() {
		crypto.getRandomValues(canary);
		canaryHex = binToHex(canary);
		createContract();
	}
</script>
{#if !showHelp}
	<button class="help-button" on:click={toggleHelp}> Show Help </button>
{:else}
	<button  on:click={toggleHelp}> Hide Help </button>
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
		<tr class="help"><td colspan="2"> Maximum value the contract can payout per period. </td></tr>
	{/if}
	<tr>
		<td>
			<label for="difficulty">Difficulty:</label>
		</td>
		<td>
			<input type="number" on:change={() => createContract()} bind:value={difficulty} required min="1" max="5" />
		</td>
	</tr>
	{#if showHelp}
		<tr class="help">
			<td colspan="2">
				How many zeros should the solution require. Hint: three is somewhat hard for a browser, one
				is trival, five is probably too hard.
			</td>
		</tr>
	{/if}
	<tr>
		<td>
			<label for="period">Period (blocks):</label>
		</td>
		<td>
			<input
				type="number"
				required
				bind:value={period}
                on:change={() => createContract()}
				min="1"
				placeholder="e.g. 1 blocks, ~10 minutes"
			/>
		</td>
	</tr>
	{#if showHelp}
		<tr class="help">
			<td colspan="2"> How often (in blocks) the covenant may be "mined". </td>
		</tr>
	{/if}

	<tr>
		<td>
			<label for="period">Canary:</label>
		</td>

		<td>
			<i>
				{canaryHex}
			</i>
			<button on:change={() => createContract()} on:click={newNonce}> random </button>
		</td>
	</tr>
	{#if showHelp}
		<tr class="help">
			<td colspan="2"> A random value to begin the covenant from. </td>
		</tr>
	{/if}
</table>
<br />

<button on:click={createContract}> Calculate Locking Script</button>
