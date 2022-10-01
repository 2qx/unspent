<script lang="ts">

    import { afterUpdate } from "svelte";
    import { contractMap } from "@unspent/phi"
    import { load } from "./machinery/loader-store"
    import Contract from "./Contract.svelte";
	
    export let instance; 
    let selected;

    let contractList = Object.keys(contractMap).map(k => { console.log(contractMap[k]); return {"code":k, "class":contractMap[k]}})

    const handleSubmit = async () => {
        await load(
            {
                load: async () => {
                    
                },
            }
        )
    }

</script>

<div>

    {#if !instance}
        <form on:submit|preventDefault={handleSubmit}>
            <select bind:value={selected} on:change="{() => instance = new selected()}">
                {#each contractList as contract }
                    <option value={contract.class}>
                        {contract.class.name}
                    </option>
                {/each}
            </select>
        
            <button type=submit>
                Create
            </button>
        </form>

    {/if}
    {#if instance}
        <Contract instance={instance}></Contract>
    {/if}

    

</div>
