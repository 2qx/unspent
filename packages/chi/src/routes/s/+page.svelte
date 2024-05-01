<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import arrow_down from '$lib/images/arrow_down.svg';
	import month from '$lib/images/month.svg';
	import wallet from '$lib/images/wallet.svg';
	import lock_clock from '$lib/images/lock_clock.svg';
	import banner from '$lib/images/banner.svg';
	import qr_code from '$lib/images/qr_code.svg';
	import chart from '$lib/images/chart.svg';
	import table from '$lib/images/table.svg';
	import share from '$lib/images/share.svg';
	import { _, isLoading } from 'svelte-i18n';
	import { toast } from '@zerodevx/svelte-toast';
	import { copy } from 'svelte-copy';
	import {
		binToBase64,
		base64ToBin,
		lockingBytecodeToCashAddress,
		cashAddressToLockingBytecode
	} from '@bitauth/libauth';
	import { Perpetuity, sanitizeAddress } from '@unspent/phi';
	import { deflate, inflate } from 'pako';
	import ContractChartSection from '$lib/ContractChartSection.svelte';
	import UtxoSection from '$lib/UtxoSection.svelte';

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

	async function createContract(save = true) {
		if (receiptAddress) {
			try {
				try {
					receiptAddress = await sanitizeAddress(receiptAddress);
					receiptAddressValid = true;
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

				let bytecode = cashAddressToLockingBytecode(receiptAddress).bytecode;
				let q = decodeURI(binToBase64(deflate(bytecode)));
				$page.url.searchParams.set('q', q);

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
		if (contract) utxoCount = (await contract.getUtxos()).length;
	};
</script>

<svelte:head>
	<title>unspent.cash</title>
	<meta name="description" content="Unspent Cash" />
</svelte:head>
<h4><img src={share} alt="share" /></h4>
{#if $isLoading}
	loading ...
{:else}
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
						<b> {$_('overview')}</b>
						<qr-code
							id="qr1"
							contents={contract.getAddress()}
							module-color="#000"
							position-ring-color="#533c0d"
							position-center-color="#d99b22"
							mask-x-to-y-ratio="1.2"
							style="
		width: 200px;
		height: 200px;
		margin: 2em auto;
		background-color: #fff;
	  "
						>
							<img src={lock_clock} slot="icon" />
						</qr-code>
						
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
					<td style="width:30px;" />
					<td colspan="2">
						<b>{balance.toLocaleString()}</b> sats <br />
						(<i
							>{(Number(balance) / 100000000).toLocaleString(undefined, {
								minimumSignificantDigits: 6
							})}</i
						> BCH)
					</td>
				{/if}
				{#if contract}
					<td />
					<td style="width:30px;">
						<img src={lock_clock} alt="lock_clock" />
					</td>
					<td colspan="2" >
						<div
							use:copy={contract.getAddress()}
							on:svelte-copy={(event) => toast.push('OK 📋🗸: ' + event.detail)}
							on:svelte-copy:error={(event) =>
								toast.push(`Error, no access to clipboard?: ${event.detail.message}`, {
									classes: ['warn']
								})}
						>
							<div style="max-width: 80%;" class="action">
								<button class="styled">
									{contract.getAddress()}
								</button>
							</div>
						</div>
					</td>
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
				<td style="line-break:anywhere;" colspan="2">
					<p>
						{#if receiptAddress}
							{receiptAddress}
						{/if}
					</p>
				</td>
			</tr>
		</table>
	</section>
	<hr />
	<h4><img src={table} alt="table" /></h4>
	<UtxoSection {receiptAddress} />
	<hr />
	<h4><img src={chart} alt="chart" /></h4>
	<ContractChartSection {receiptAddress} />
{/if}

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	#form1 {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	table {
		border: 1mm ridge rgba(192, 50, 220, 0.6);
		background-color: white;
	}
	table tr td {
		min-width: 5%;
	}

	table tr td p {
		font-size: small;
		display: flex;
	}

	table tr td pre {
		white-space: pre-wrap;
	}

	.styled {
		border-color: #000;
		line-break: anywhere;
		font-size: 1rem;
		text-align: center;
		color: #000;
		border-radius: 10px;
		background-color: #fff3e2;
		font-weight: 700;
		padding: 5px;
		box-shadow: inset 2px 2px 3px rgba(255, 255, 255, 0.6), inset -2px -2px 3px rgba(0, 0, 0, 0.6);
	}

	.styled:hover {
		background-color: rgb(255, 184, 54);
	}

	.styled:active {
		box-shadow: inset -2px -2px 3px rgba(255, 255, 255, 0.6), inset 2px 2px 3px rgba(0, 0, 0, 0.6);
	}

	h1 {
		width: 100%;
		font-weight: 900;
		color: #d99b22;
	}
</style>
