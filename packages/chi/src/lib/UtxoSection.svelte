<script>
	import { beforeUpdate } from 'svelte';
	import { Perpetuity } from '@unspent/phi';
	import { _ } from 'svelte-i18n';
	import arrow_split from '$lib/images/arrow_split.svg';
	import lock_clock from '$lib/images/lock_clock.svg';

	export let receiptAddress = '';
	let utxos = [];
	let contract;
	let isLoading = true;

	let executedSuccess = false;
	let txid = '';
	let executeError = '';

	let curHeight = -1;
	let now = Date.now();

	beforeUpdate(async () => {
		if (receiptAddress) {
			if (!contract) {
				contract = new Perpetuity(4383, receiptAddress, 1500, 96);
				if (contract) {
					await loadSeries();
				}
			}
		}
	});

	const execute = async (utxo) => {
		executedSuccess = false;
		try {
			txid = await contract.execute(receiptAddress, undefined, [utxo]);
			executedSuccess = true;
			executeError = '';
		} catch (e) {
			executeError = e;
		}
	};

	const loadSeries = async () => {
		utxos = await contract.getUtxos();
		curHeight = await contract.provider.getBlockHeight();
		utxos = utxos.sort((a, b) => a.height - b.height);
		utxos = utxos.map((u) => {
			let waitBlocks = u.height + 4383 - curHeight;
			return {
				...u,
				estimateUnlockDate: new Date(now + waitBlocks * 600000).toLocaleString(),
				waitBlocks: waitBlocks
			};
		});
		isLoading = false;
	};
</script>

<section>
	{#if utxos && utxos.length > 0}
		{txid}
		{executeError}
		{#each utxos as op}
			<table>
				<tr>
					<td>
						{#if curHeight > 0 && op.waitBlocks > 0}
							<img src={lock_clock} alt={$_('ok')} />
							<b>{op.waitBlocks}</b>
						{/if}
					</td>

					<td>
						<b>{op.satoshis.toLocaleString()}</b> sats <br />
						<i>
							{(Number(op.satoshis) / 100000000).toLocaleString(undefined, {
								minimumSignificantDigits: 6
							})} BCH
						</i>
					</td>
				</tr>
				<tr>
					<td>
						{#if op.waitBlocks < 0}
							<button on:click={async () => execute(op)}>
								<img src={arrow_split} />
							</button>
						{:else}
							<button on:click={async () => execute(op)}>
								<img src={arrow_split} />
							</button>
						{/if}
					</td>
					<td colspan="3" style="line-break: anywhere;">
						{#if curHeight > 0 && op.waitBlocks > 0}
							<p>{op.estimateUnlockDate}</p>
						{/if}
						<b>{(op.satoshis / 96n).toLocaleString()}</b> sats <br />
					</td>
				</tr>
			</table>
		{/each}
	{:else if !isLoading && utxos.length == 0}
		0 sats
	{:else}
		<progress id="progress-bar" aria-label="Content loading…" />
	{/if}
</section>

<style>
	div {
		max-width: 600px;
	}

	table {
		border: 1mm ridge rgba(211, 220, 50, 0.6);
	}
	table tr td {
		border-width: 1px;
		padding: 15px;
		border-style: inset;
		border-color: gray;
		background-color: white;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
		line-break: normal;
	}
</style>
