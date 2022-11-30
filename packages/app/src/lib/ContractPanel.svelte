<script>
	import { afterUpdate } from 'svelte';
	import makeBlockie from 'ethereum-blockies-base64';
	import { Panel, Header, Content } from '@smui-extra/accordion';
	import IconButton, { Icon } from '@smui/icon-button';
	import Contract from '$lib/Contract.svelte';
	
	import { binToHex } from '@bitauth/libauth';
	import { opReturnToInstance } from '@unspent/phi';
	import { load } from '$lib/machinery/loader-store.js';
	export let data;
	let instance;
  let error = "";
  let panelOpen = false;

	const init = async () => {
		await load({
			load: async () => {
        try{
          instance = opReturnToInstance(data.opReturn);
        }catch (e){
          if(e.message){
            error = e
          } else{
            error = JSON.stringify(e)
          }
        }
			}
		});
	};

	afterUpdate(async () => {
    if(panelOpen){
      if(!instance){
        await init();
      }
     
    }
	});

</script>

<Panel square variant="outlined" color="primary" extend on:change={afterUpdate} bind:open={panelOpen}>
	<Header  >
		<img style="height:50px; width:50px;" alt={data.lockingBytecode} src={makeBlockie(binToHex(data.lockingBytecode))} />
		<span slot="description">{data.name}</span>

		<IconButton slot="icon" toggle pressed={panelOpen}>
			<Icon class="material-icons" on>unfold_less</Icon>
			<Icon class="material-icons">unfold_more</Icon>
		</IconButton>
	</Header>
	<Content>
		{#if instance}
			<Contract bind:instance />
		{/if}
    {#if error}
    <pre>{error}</pre>
    {/if}
	</Content>
</Panel>
