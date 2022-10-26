<script lang="ts">
  	import { beforeUpdate } from 'svelte';
    import { load } from '$lib/machinery/loader-store.js';
    import { getRecords, Record } from "@unspent/phi";
    import { protocol, chaingraphHost, node } from '$lib/store.js';
	import { cashAddressToLockingBytecode } from '@bitauth/libauth';

    export let opReturnHex :string;

    let isPublished:boolean;
    let result = "";
    
	let chaingraphHostValue = '';
	let nodeValue = '';

	chaingraphHost.subscribe((value) => {chaingraphHostValue = value});
	node.subscribe((value) => {nodeValue = value});


    beforeUpdate(async () => {
		await check()
	});

	const check = async () => {
        await load(
            {
                load: async () => {
                    if(opReturnHex.length > 0){
                        let queryHex = opReturnHex.length > 50 ? opReturnHex.slice(0,50) : opReturnHex
                        let records = await getRecords(chaingraphHostValue, queryHex, nodeValue)
                        isPublished = records.length > 0 ? true : false
                    }
                }
            }
        )
    }
    const broadcast = async() => {
                    let r = new Record()
                    console.log(opReturnHex)
                    let result = await r.broadcast(opReturnHex)
                    console.log(JSON.stringify(result))

    }
</script>
{#if isPublished==undefined}
checking records ...
{:else if isPublished==true}
<button disabled>Published</button> 
{:else}
<button class="hit-me" id="opreturn" on:click={broadcast}>{opReturnHex}</button>
{/if}


<style>
    #opreturn{
        font-size: xx-small;
    }
</style>