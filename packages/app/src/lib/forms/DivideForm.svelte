<script lang="ts">
	import AddressOptional from '$lib/AddressOptional.svelte';
    import { Divide } from '@unspent/phi';
    import { toast } from '@zerodevx/svelte-toast'
	export let contract;
	let isPublished = false;
    let showHelp = false;

	let payees:string[] = ["",""]
	let executorAllowance = 1200;
	function createContract() {
		
		try{
			contract = new Divide(executorAllowance, payees );
		}catch (e:Error){
			toast.push(e, { classes: ['warn'] })
		}
	}


    function addPayee(){
        if(payees.length<4) {
            payees.push("")
			payees=payees
        }else{
            toast.push('Maximum of four (4) addresses.')
        }

    }

    function handleRemoval(event){
        if(payees.length>2) {
           payees.splice(event.detail.addressIdx, 1);
		   payees=payees
        }else{
            toast.push('Minimum of two addresses required.')
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
			<label for="executorAllowance">Executor Allowance:</label>
		</td>

		<td
			><input type="number" bind:value={executorAllowance} on:change={() => createContract()} min="843" max="12000"  required /></td
		>
	</tr>
	{#if showHelp}
		<tr class="help">
			<td colspan="2"> Remainder for the execution of the contract and miner fees.</td>
		</tr>
	{/if}
    <tr>
		<td>
			<label for="payees">Payees:</label>
			{#if payees.length<4}
			<button on:click={addPayee}>+</button>
			{/if}
		</td>
        <td>
        {#each payees as payee, i}
            <AddressOptional bind:address={payee} index={i} on:message={handleRemoval} on:change={() => createContract()}></AddressOptional>
        {/each}

		</td>
	</tr>
	{#if showHelp}
		<tr class="help">
			<td colspan="2"> Addresses to recieve equal (roughly) payouts minus executor fee.</td>
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