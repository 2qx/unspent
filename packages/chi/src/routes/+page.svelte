<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import lock from '$lib/images/lock.svg';
	import arrow_back from '$lib/images/arrow_back.svg';
	import arrow_down from '$lib/images/arrow_down.svg';
	import arrow_step from '$lib/images/arrow_step.svg';
	import lock_clock from '$lib/images/lock_clock.svg';
	import month from '$lib/images/month.svg';
	import { _ } from 'svelte-i18n';
	import { toast } from '@zerodevx/svelte-toast';
	import CopyToClipboard from '$lib/CopyToClipboard.svelte';
	import BroadcastAction from '$lib/BroadcastAction.svelte';
	import {
		binToBase64,
		base64ToBin,
		lockingBytecodeToCashAddress,
		cashAddressToLockingBytecode
	} from '@bitauth/libauth';
	import { Perpetuity, sanitizeAddress } from '@unspent/phi';
	import { deflate, inflate } from 'pako';
	import { receiptAddressStore } from '$lib/store.js';

	export let data;
	export let p;
	let balance;
	let utxoCount;
	let receiptAddress;
	let contract;
	let receiptAddressValid = false;

	if (data.q) {
		if (!receiptAddress) {
			let bytecode = inflate(base64ToBin(encodeURI(data.q)));
			receiptAddress = lockingBytecodeToCashAddress(bytecode);
			receiptAddressValid = true;
			createContract(false);
		}
	}


	async function createContract(save=true) {
		if (receiptAddress) {
			try {
				try {
					receiptAddress = await sanitizeAddress(receiptAddress);
					receiptAddressValid = true;
          if(save){
            receiptAddressStore.set(receiptAddress);
          }
				} catch (e) {
					receiptAddressValid = false;
					if (e.message) {
						toast.push(e.message, { classes: ['warn'] });
					} else {
						toast.push(e, { classes: ['warn'] });
					}
				}
				contract = new Perpetuity(4383, receiptAddress, 1500, 96);
        updateBalance();

				// let bytecode = cashAddressToLockingBytecode(receiptAddress).bytecode;
				// let q = decodeURI(binToBase64(deflate(bytecode)));
				// $page.url.searchParams.set('q', q);
				
				// goto(`?${$page.url.searchParams.toString()}`);
			} catch (e) {
				contract = undefined;

				if (e.message) {
					toast.push(e.message, { classes: ['warn'] });
				} else {
					toast.push(e, { classes: ['warn'] });
				}
			}
		} else {
			contract = undefined;
			balance = undefined;
		}
	}

	const updateBalance = async () => {
		if (contract) balance = await contract.getBalance();
		if (contract) utxoCount = (await contract.getUtxos()).length;
	};

	function updateReceiptAddress() {
		receiptAddressStore.set(receiptAddressValue);
	}

	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
		if (receiptAddress && !contract) createContract();
	});

	function clearReceiptAddress() {
		receiptAddressValue = '';
		receiptAddress.set('');
	}
</script>

<svelte:head>
	<title>∑ ₿ᵪ</title>
	<meta name="description" content="Unspent Cash" />
</svelte:head>

<section>
	<table>
		<tr>
			{#if balance}
				<td style="text-align: center;">
					{#if utxoCount > 0}
						<b>{utxoCount} UTXO(s)</b>
					{/if}
				</td>
				<td colspan="3">
					<b>{balance.toLocaleString()}</b> sats <br />
					(<i
						>{(Number(balance) / 100000000).toLocaleString(undefined, {
							minimumSignificantDigits: 6
						})}</i
					> BCH)
				</td>
			{:else}
				<td colspan="4" />
			{/if}
		</tr>
		<tr>
			{#if contract}
				<td>
					<p>
						<img src={lock} alt="lock" />
					</p>
				</td>
				<td colspan="3">
					<CopyToClipboard on:copy={() => toast.push('📋🗸')} text={contract.getAddress()} let:copy>
						<div class="action">
							<button on:click={copy}>
								{contract.getAddress()}
							</button>
						</div>
					</CopyToClipboard>
				</td>
			{:else}
				<td colspan="4">{$_('create')}</td>
			{/if}
		</tr>
		{#if receiptAddressValid}
			<tr style="background-color: lightgray;">
				<td>
					<p>1 m; 4383 blocks</p>
				</td>
				<td style="max-width: 40px;">
					<p>1/96</p>
				</td>
				<td>
					<p>95/96</p>
				</td>
				<td>
					<p>
						{new Intl.NumberFormat().format(1500)} sat
					</p>
				</td>
			</tr>
			<tr style="background-color: lightgray;">
				<td>
					<p>
						<img src={month} alt="month" />
						<img src={lock_clock} alt="lock_clock" />
					</p>
				</td>
				<td>
					<p><img src={arrow_down} alt="to" /></p>
				</td>
				<td>
					<p>
						<img src={arrow_back} alt="back" />
					</p>
				</td>
				<td>
					<p>
						<img src={arrow_step} alt="step" />
					</p>
				</td>
			</tr>
		{/if}
		<tr>
			<td />
			<td style="line-break:auto;" colspan="3">{$_('receive')}:</td>
		</tr>
		<tr>
			<td>
				{#if contract}
					<p>
						<BroadcastAction opReturnHex={contract.toOpReturn(true)} />
					</p>
				{/if}
			</td>
			<td colspan="3">
				<textarea id="addr" on:change={() => createContract()} bind:value={receiptAddress} />
			</td>
		</tr>
	</table>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
		line-break: anywhere;
	}

	#form1 {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	table {
		border: 4mm ridge rgba(211, 220, 50, 0.6);
	}
	table tr td {
		min-width: 20%;
		justify-content: space-around;
	}

	table tr td p {
		font-size: small;
		display: flex;
		justify-content: space-around;
	}

	table tr td pre {
		white-space: pre-wrap;
	}

	h1 {
		width: 100%;
	}

	textarea {
		width: 100%;
		height: 40px;
	}
</style>
