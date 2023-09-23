<script>
	import { beforeUpdate } from 'svelte';
	import { Perpetuity } from '@unspent/phi';
	import { receiptAddressStore } from '$lib/store.js';
	import { _ } from 'svelte-i18n';
	import arrow_split from '$lib/images/arrow_split.svg';
	import lock_clock from '$lib/images/lock_clock.svg';

	let receiptAddress = '';
	let utxos = [];
	let contract;
	let isLoading = true;

  let executedSuccess = false;
  let txid = '';
  let executeError = '';

	let curHeight = -1;
	let now = Date.now();

	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
	});

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
			txid = await contract.execute(address, undefined, [utxo]);
			executedSuccess = true;
			executeError = '';
		} catch (e: any) {
			executeError = e;
		}
	};

	const loadSeries = async () => {
		utxos = await contract.getUtxos();
		curHeight = await contract.provider.getBlockHeight();
		utxos = utxos.map((u) => {
			let waitBlocks = u.height + 4838 - curHeight;
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
		{#each utxos as op}
			<table>
				<tr>
					<td>
						{#if curHeight > 0 && op.height + contract.period - curHeight > 0}
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
							<button>
								<img src={arrow_split} />
							</button>
						{:else}
							<button disabled on:click={execute(op)}>
								<img src={arrow_split} />
							</button>
						{/if}
            
						{#if curHeight > 0 && op.height + contract.period - curHeight > 0}
							
							<p>{op.estimateUnlockDate}</p>
						{/if}
					</td>
					<td colspan="3">
						{op.txid}:{op.vout}
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
		line-break: anywhere;
	}
</style>
