<script>
	import { beforeUpdate } from 'svelte';
	import { Perpetuity } from '@unspent/phi';
	import { _ } from 'svelte-i18n';
	import arrow_split from '$lib/images/arrow_split.svg';
	import lock_clock from '$lib/images/lock_clock.svg';
	import copy from '$lib/images/copy.svg';
	import { toast } from '@zerodevx/svelte-toast';
	import CopyToClipboard from '$lib/CopyToClipboard.svelte';

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
		{#if contract}
			<table width="300px">
				<tr>
					<td>
						<p>
							<img src={lock_clock} alt={$_('ok')} />
						</p>
					</td>
					<td>
						<p><b>0 ₿</b></p>
					</td>
				</tr>
				<tr>
					<td style="line-break:anywhere;" colspan="2">
						<img src={copy} />
						<CopyToClipboard
							on:copy={() => toast.push('📋🗸')}
							text={contract.getAddress()}
							let:copy
						>
							<div class="action">
								<button class="styled" on:click={copy}>
									{contract.getAddress()}
								</button>
							</div>
						</CopyToClipboard>
					</td>
				</tr>
			</table>
		{/if}
		<br />
		<br />
		<p>
			<img width="300px" src="/h/13.svg" alt="send bitcoin" />
		</p>
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

  .styled {
		border-color: #000;
		font-size: 1rem;
		text-align: center;
		color: #000;
		border-radius: 10px;
		background-color: #fff3e2;
		font-weight: 700;
    padding: 5px;
    box-shadow:
    inset 2px 2px 3px rgba(255, 255, 255, 0.6),
    inset -2px -2px 3px rgba(0, 0, 0, 0.6);
	}

	.styled:hover {
		background-color: rgb(255, 184, 54);
	}

	.styled:active {
		box-shadow: inset -2px -2px 3px rgba(255, 255, 255, 0.6), inset 2px 2px 3px rgba(0, 0, 0, 0.6);
	}
</style>
