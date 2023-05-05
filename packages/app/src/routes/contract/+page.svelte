<script lang="ts">
	import Contract from '$lib/Contract.svelte';
	import Card from '@smui/card';
	import { stringToInstance, opReturnToInstance } from '@unspent/phi';
	export let data: any;
	let instance;
	let error;
	try {
		if (data.opReturn) {
			instance = opReturnToInstance(data.opReturn, data.network);
		} else if (data.serialized) {
			instance = stringToInstance(data.serialized, data.network);
		}
	} catch (e: any) {
		error = e;
	}
</script>

<svelte:head>
	<title>Contract</title>
	{#if instance}
		<meta name="description" content={instance.asText()} />
	{/if}
</svelte:head>
<section>
	{#if error}
		<p><b>Failed to parse contract: </b></p>
		<pre>{error}</pre>
	{/if}
</section>
<section>
	<div class="card-display">
		<div class="card-container">
			<Card class="demo-spaced">
				<div class="margins">
					{#if instance}
						<Contract bind:instance />
					{/if}
				</div>
			</Card>
		</div>
	</div>
</section>

<style>
	* :global(.margins) {
		margin: 18px 10px 24px;
	}
</style>
