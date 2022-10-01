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

    afterUpdate(() => {
                    onClick: async () => init()
    })
</script>

<tr>
    <td>
        <button on:click={init}>
            Load
        </button>
    </td>
    <td>
        {data.options.network}
    </td>
    <td>
        { data.name }
    </td>
    <td>
        v{data.options.version}
    </td>
    <td>
       <Address address={data.address} /> 
    </td>

</tr>

{#if instance}
<Contract bind:instance={instance}></Contract>
{/if}