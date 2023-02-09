<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { base } from '$app/paths';
	import { Confetti } from 'svelte-confetti';
	import Tooltip, { Wrapper } from '@smui/tooltip';
	import Button, { Label, Icon } from '@smui/button';
	import CircularProgress from '@smui/circular-progress';

	import { load } from '$lib/machinery/loader-store.js';
	import { getRecords, Record } from '@unspent/phi';
	import { chaingraphHost, node } from '$lib/store.js';

	export let opReturnHex: string;

	let preRecord = '';
	let isPublished: boolean;
	let txid = '';

	let executionProgress = 0;
	let executionProgressId: any;
	let executionProgressClosed = true;
	let executedSuccess = false;
	let executeError = '';

	let chaingraphHostValue = '';
	let nodeValue = '';

	chaingraphHost.subscribe((value) => {
		chaingraphHostValue = value;
	});
	node.subscribe((value) => {
		nodeValue = value;
	});

	beforeUpdate(async () => {
		if (opReturnHex !== preRecord) {
			preRecord = opReturnHex;
			executionProgressClosed = true;
			executedSuccess = false;
			executeError = '';
			txid = '';
			await check();
		}
	});

	function setProgress() {
		executionProgress = 0;
		executionProgressClosed = false;

		executionProgressId = setInterval(() => {
			executionProgress += 0.01;
		}, 100);
	}

	function clearProgress() {
		executionProgressClosed = true;
		clearTimeout(executionProgressId);
	}

	const check = async () => {
		await load({
			load: async () => {
				if (opReturnHex.length > 0) {
					let queryHex = opReturnHex.length > 50 ? opReturnHex.slice(0, 50) : opReturnHex;
					let records = await getRecords(chaingraphHostValue, queryHex, nodeValue);
					records = records.filter((r) => r == opReturnHex);
					isPublished = records.length > 0 ? true : false;
				}
			}
		});
	};

	const broadcast = async () => {
		try {
			setProgress();
			executedSuccess = false;
			let r = new Record();
			txid = await r.broadcast(opReturnHex);
			isPublished = true;
			executedSuccess = true;
			executeError = '';
			clearProgress();
		} catch (e) {
			executeError = e;
			clearProgress();
		}
	};
</script>

{#if isPublished == undefined}
	<Wrapper>
		<Button color="secondary" disabled variant="outlined">
			<Label>Checking...</Label>
			<Icon class="material-icons">hourglass_top</Icon>
		</Button>
		<Tooltip>Checking if contract is published.</Tooltip>
	</Wrapper>
{:else if isPublished == true}
	<Wrapper>
		<Button color="secondary"  variant="outlined" disabled>
			<Label>Published</Label>
			<Icon class="material-icons">check</Icon>
		</Button>
		<Tooltip>The contract arguments were recorded in a previous transaction.</Tooltip>
	</Wrapper>
	{#if txid}
		<div style="display: flex; justify-content: center">
			<Confetti colorRange={[75, 174]} />
		</div>
		Transaction:<a style="max-width=30em; line-break:anywhere;" href="{base}/explorer?tx={txid}"
			>{txid}</a
		>
	{/if}
{:else}
	<Wrapper>
		<Button variant="raised" touch on:click={broadcast}>
			<Label>Broadcast</Label>
			<Icon class="material-icons">campaign</Icon>
		</Button>
		<Tooltip>Record the contract details on the blockchain.</Tooltip>
	</Wrapper>

	{#if !executionProgressClosed}
		<div style="display: flex; justify-content: center">
			<CircularProgress
				style="height: 48px; width: 48px;"
				progress={executionProgress}
				closed={executionProgressClosed}
			/>
		</div>
	{/if}
	{#if executeError}
		<pre>{executeError}</pre>
	{/if}
{/if}

<style>
</style>
