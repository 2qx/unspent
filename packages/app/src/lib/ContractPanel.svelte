<script type="ts">
	import { afterUpdate } from 'svelte';
	import makeBlockie from 'ethereum-blockies-base64';
	import { Panel, Header, Content } from '@smui-extra/accordion';
	import Badge from '@smui-extra/badge';
	import Button, { Label } from '@smui/button';
	import IconButton, { Icon } from '@smui/icon-button';
	import Contract from '$lib/Contract.svelte';
	import ErrorConsole from './ErrorConsole.svelte';

  import { node } from '$lib/store.js';

	import { binToHex } from '@bitauth/libauth';
	import { opReturnToInstance } from '@unspent/phi';
	import { load } from '$lib/machinery/loader-store.js';

	export let data:any;
	let instance:any;
	let error = '';
	let panelOpen = false;
  let nodeValue = '';

  node.subscribe((value) => {
		nodeValue = value;
	});

	const init = async () => {
		await load({
			load: async () => {
				try {
					instance = opReturnToInstance(data.opReturn, nodeValue);
				} catch (e:any) {
					if (e.message) {
						error = e;
					} else {
						error = JSON.stringify(e);
					}
				}
			}
		});
	};

	afterUpdate(async () => {
		if (panelOpen) {
			if (!instance) {
				await init();
			}
		}
	});
</script>

<Panel
	square
	variant="outlined"
	color="primary"
	extend
	style="overflow:auto;"
	on:change={afterUpdate}
	bind:open={panelOpen}
>
	<Header>
		<span style="position: relative; display: inline-block; padding: .5em .5em 0 0;">
			<img
				style="height:50px; width:50px;"
				alt={data.lockingBytecode}
				src={makeBlockie(binToHex(data.lockingBytecode))}
			/>
			{#if data.spendable > 0}
				<Badge align="top-end" color="custom-green" aria-label="spendable"
					>{data.spendable.toLocaleString()}</Badge
				>
				{#if data.executorAllowance > 0}
					<Badge align="bottom-end" aria-label="executor allowance"
						>{data.executorAllowance.toLocaleString()}</Badge
					>
				{/if}
			{/if}
		</span>

		<span slot="description" style=" position: relative; inline-block; padding: .5em .5em 0 0;">
			{data.name}
		</span>
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
			<ErrorConsole errorText={error} />
		{/if}
	</Content>
</Panel>
