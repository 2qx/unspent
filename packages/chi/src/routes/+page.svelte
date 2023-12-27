<script>
	import { base } from '$app/paths';
	import help from '$lib/images/help.svg';

	import arrow_down from '$lib/images/arrow_down.svg';
	import banner from '$lib/images/banner.svg';
	import wallet from '$lib/images/wallet.svg';
	import lock_clock from '$lib/images/lock_clock.svg';
	import month from '$lib/images/month.svg';
	import { _ } from 'svelte-i18n';
	import { toast } from '@zerodevx/svelte-toast';
	import CopyToClipboard from '$lib/CopyToClipboard.svelte';
	import BroadcastAction from '$lib/BroadcastAction.svelte';
	import { cashAddressToLockingBytecode } from '@bitauth/libauth';
	import { Perpetuity, sanitizeAddress } from '@unspent/phi';
	import { receiptAddressStore, stateStore } from '$lib/store.js';

	export let data;
	export let p;
	let balance;
	let utxoCount;
	let receiptAddress;
	let stateValue;
	let contract;
	let receiptAddressValid = false;
	let lockingBytecode;

	async function createContract(save = true) {
		if (receiptAddress) {
			try {
				try {
					receiptAddress = await sanitizeAddress(receiptAddress);
					receiptAddressValid = true;
					if (save) {
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

				lockingBytecode = cashAddressToLockingBytecode(receiptAddress).bytecode;
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
		if (balance > 0) {
			if (stateValue < 7) {
				stateStore.set('7');
			}
		}
		if (balance > 100e6) {
			if (stateValue < 8) {
				stateStore.set('8');
			}
		}
	};

	function updateReceiptAddress() {
		receiptAddressStore.set(receiptAddressValue);
	}

	stateStore.subscribe((value) => {
		stateValue = Number(value);
	});

	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
		if (receiptAddress && !contract) createContract();
		if (receiptAddress && stateValue < 3) {
			stateStore.set('3');
		}
	});

	const handleCopyClick = async () => {
		if (stateValue > 4) {
			if (stateValue < 6) {
				stateStore.set('6');
			}
		}
		toast.push('📋🗸');
	};
</script>

<svelte:head>
	<title>Unspent Cash</title>
	<meta name="description" content="Unspent Cash" />
</svelte:head>
<section>
	<table>
		<tr>
			<td colspan="4"> <h1>unspent.cash</h1></td>
		</tr>
		<tr>
			{#if contract}
				<td style="text-align: center;">
					<img width="125px" src={banner} />
				</td>
				<td colspan="3">
					<CopyToClipboard on:copy={handleCopyClick} text={contract.getAddress()} let:copy>
						<div style="max-width: 80%;" class="action">
							<button on:click={copy}>
								{contract.getAddress()}
							</button>
						</div>
					</CopyToClipboard>
				</td>
			{:else}
				<td style="text-align: center;">
					<img width="125px" src={banner} />
				</td>
				<td colspan="3"><b> {$_('create')}</b></td>
			{/if}
		</tr>
		<tr>
			{#if balance}
				<td />
				<td style="width:30px;">
					<img src={lock_clock} alt="lock_clock" />
				</td>
				<td colspan="2">
					<b>{balance.toLocaleString()}</b> sats <br />
					(<i
						>{(Number(balance) / 100000000).toLocaleString(undefined, {
							minimumSignificantDigits: 6
						})}</i
					> BCH)
				</td>
			{:else}
				<td />
				<td style="width:30px;">
					<img src={lock_clock} alt="lock_clock" />
				</td>
				<td colspan="2" />
			{/if}
		</tr>
		{#if receiptAddressValid}
			<tr>
				<td />
				<td>
					<p><img src={arrow_down} alt="to" /></p>
				</td>
				<td>
					<p>
						<b>1.04% month</b>
					</p>
					<p>
						<b>11.8% year</b>
					</p>
				</td>
				<td>
					<p>
						<img src={month} alt="month" />
					</p>
				</td>
			</tr>
		{/if}
		<tr>
			<td />
			<td style="width=30px;">
				<p>
					<img src={wallet} alt="wallet" />
				</p>
			</td>
			<td colspan="2">
				<textarea
					id="addr"
					on:change={() => createContract()}
					bind:value={receiptAddress}
					placeholder="bitcoincash:q... ..."
				/>
			</td>
		</tr>
		<tr>
			<td />
			{#if contract}
				<td style="text-align: end; padding: 20px;" colspan="3">
					<BroadcastAction opReturnHex={contract.toOpReturn(true)} {lockingBytecode} />
				</td>
			{:else}
				<td style="line-break:auto;" colspan="3">{$_('receive')}:</td>
			{/if}
		</tr>
	</table>
	{#if !contract}
		<div>
			<a href="{base}/help">
				<img width="100px" src={help} alt="help" />
			</a>
		</div>
	{/if}
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
		background-color: white;
	}
	table tr td {
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
		font-weight: 900;
		color: #d99b22;
	}

	textarea {
		width: 90%;
		height: max-content;
	}
</style>
