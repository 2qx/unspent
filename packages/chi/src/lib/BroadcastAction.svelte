<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { _ } from 'svelte-i18n';
	import heart from '$lib/images/heart.svg';
	import { Record } from '@unspent/phi';
	import { getRecords } from '@unspent/psi';
	import ShareLink from './ShareLink.svelte';
	import { stateStore } from '$lib/store.js';
  let stateValue;
	export let opReturnHex: string;
	export let lockingBytecode: string;
 

	let preRecord = '';
	let isPublished: boolean;
	let txid = '';

	let executionProgress = 0;
	let executionProgressId: any;
	let executionProgressClosed = true;
	let executedSuccess = false;
	let executeError = '';

  stateStore.subscribe((value) => {
		stateValue = Number(value);
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
		isPublished = true;
	}

	const check = async () => {
		if (opReturnHex.length > 0) {
			let queryHex = opReturnHex.length > 60 ? opReturnHex.slice(0, 60) : opReturnHex;
			let records = await getRecords('https://demo.chaingraph.cash/v1/graphql', queryHex);
			records = records.filter((r) => r == opReturnHex);
			isPublished = records.length > 0 ? true : false;
			console.log('is published: ', isPublished);
			if (isPublished && stateValue < 4) {
				stateStore.set('4');
			}
		}
	};

	const broadcast = async () => {
		try {
			setProgress();
			executedSuccess = false;
			let options = { network: 'mainnet', version: 2 };
			let r = new Record(undefined, undefined, options);
			txid = await r.broadcast(opReturnHex);
			isPublished = true;
			executedSuccess = true;
			executeError = '';
      if (isPublished && stateValue < 4) {
				stateStore.set('4');
			}
			clearProgress();
		} catch (e) {
			executeError = e;
			clearProgress();
		}
	};
</script>

{#if isPublished == undefined}
	<div class="action">
		<button disabled>
			<progress id="progress-bar" aria-label="Content loading…" />
		</button>
	</div>
{:else if isPublished == true}
	<div class="action">
		<ShareLink {lockingBytecode} />
	</div>
{:else}
	<div>
		<button class="hitMe" on:click={broadcast}>
			<img src={heart} alt="heart" />
		</button>
	</div>

	{#if !executionProgressClosed}
    <br>
		<progress id="progress-bar" aria-label="Content loading…" />
	{/if}
	{#if executeError}
		<pre>{executeError}</pre>
	{/if}
{/if}

<style>
	#progress-bar {
		max-width: 70px;
	}

	.hitMe {
		animation: blinker 1s linear infinite;
		border: 0;
		padding: 0 20px;
		font-size: 1rem;
		text-align: center;
		color: #fff;
		text-shadow: 1px 1px 1px #000;
		border-radius: 50px;
		background-color: rgb(220, 132, 0);
		background-image: linear-gradient(
			to top left,
			rgba(0, 0, 0, 0.2),
			rgba(0, 0, 0, 0.2) 30%,
			rgba(0, 0, 0, 0)
		);
		box-shadow: inset 2px 2px 3px rgba(255, 255, 255, 0.6), inset -2px -2px 3px rgba(0, 0, 0, 0.6);
    padding: 15px;
	}

	@keyframes blinker {
		50% {
			opacity: 0;
		}
	}
</style>
