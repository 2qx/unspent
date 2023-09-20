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
	let receiptAddress;
	let contract;
	let receiptAddressValid = false;

	if (data.q) {
		if (!receiptAddress) {
			let bytecode = inflate(base64ToBin(encodeURI(data.q)));
			receiptAddress = lockingBytecodeToCashAddress(bytecode);
			receiptAddressValid = true;
			createContract();
		}
	}

	if (data.p) {
		p = data.p;
	}

	async function createContract() {
		if (receiptAddress) {
			try {
				try {
					receiptAddress = await sanitizeAddress(receiptAddress);
					receiptAddressValid = true;
					receiptAddressStore.set(receiptAddress);
				} catch (e) {
					receiptAddressValid = false;
					if (e.message) {
						toast.push(e.message, { classes: ['warn'] });
					} else {
						toast.push(e, { classes: ['warn'] });
					}
				}
				contract = new Perpetuity(4383, receiptAddress, 1500, 96);
				let bytecode = cashAddressToLockingBytecode(receiptAddress).bytecode;
				let q = decodeURI(binToBase64(deflate(bytecode)));
				$page.url.searchParams.set('q', q);
				updateBalance();
				goto(`?${$page.url.searchParams.toString()}`);
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
				<td />
				<td colspan="3">
					<b>{balance.toLocaleString()}</b> sats
				</td>
			{:else}
				<td colspan="4" />
			{/if}
		</tr>
		<tr>
			{#if contract}
				<td>
          <img src={lock} alt="lock" />
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
				<td><img src={lock} alt="lock" /></td>
				<td colspan="4">{$_('create')}</td>
			{/if}
		</tr>
		{#if receiptAddressValid}
			<tr>
				<td>
					<p>1 m</p>
					<img src={month} alt="month" />
					<img src={lock_clock} alt="lock_clock" />
				</td>
				<td>
					<p>1/96</p>

					<img src={arrow_down} alt="to" />
				</td>
				<td>
					<p>95/96</p>
					<img src={arrow_back} alt="back" />
				</td>
				<td>
					<p>{new Intl.NumberFormat().format(1500)} sat</p>
					<img src={arrow_step} alt="step" />
				</td>
			</tr>
		{/if}
		<tr>
			<td />
			<td style="line-break:auto;" colspan="3">{$_('receive')}:</td>
		</tr>
		<tr>
			<td />
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
	}

	table tr td p {
		font-size: small;
	}

	h1 {
		width: 100%;
	}

	textarea {
		width: 100%;
		height: 40px;
	}
</style>
