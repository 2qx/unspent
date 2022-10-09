<script>
    import { afterUpdate } from "svelte";
    import { opReturnToInstance } from "@unspent/phi";
    import { load } from "./machinery/loader-store";
    import Contract from "./Contract.svelte";
    import Address from "./Address.svelte";
	export let data;
    let instance; 

    
    
    const init = async () => {
        await load(
            {
                load: async () => {
                    instance = opReturnToInstance(data.opReturn) 
                },
            }
        )
    }

    function collapse(){
        instance = undefined
    }

    afterUpdate(() => {
                    onClick: async () => init()
    })
</script>

<div id="flex-container">
    <span class="loader">
        {#if !instance}
        <button on:click={init}>
            Load
        </button>
        {/if}
        {#if instance}
        <button on:click={collapse}>
            Close
        </button>
        {/if}
    </span>
    <span class="contractName">
        { data.name }
    </span>
    <span class="version">
        v{data.options.version}
    </span>
    <span class="cashaddr">
        <Address address={data.address} /> 
     </span>
</div>


{#if instance}
<Contract bind:instance={instance}></Contract>
{/if}
<hr>

<style>
    #flex-container {
    display: flex;
    flex-direction: row;
    }

    #flex-container > .loader {
        width: 7rem;
    }

    #flex-container > .cashaddr {
      flex: auto;
    }

    #flex-container > .contractName {
        width: 7rem;
    }
    #flex-container > .version {
        width: 3rem;
    }

</style>