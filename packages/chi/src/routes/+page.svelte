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

  const bumpLevel = async () => {
		if (stateValue < 6) {
			stateStore.set('6');
		}
	};

	const handleCopyClick = async () => {
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
      <td style="text-align: center;">
        <img width="125px" src={banner} />
      </td>
			<td colspan="3"> <h1>unspent.cash</h1></td>
		</tr>
		<tr>
			{#if contract}
				<td style="text-align: center;">
					
				</td>
        <td>
          <img src={lock_clock} alt="lock_clock" />
        </td>
				<td colspan="2">
					<CopyToClipboard on:copy={handleCopyClick} text={contract.getAddress()} let:copy>
						<div style="max-width: 95%;" on:click={bumpLevel} class="contract-div">
							<button class="styled" on:click={copy}>
								{contract.getAddress()}
							</button>
						</div>
					</CopyToClipboard>
				</td>
			{:else}
				<td style="text-align: center;">
				</td>
				<td colspan="3"><b> {$_('create')}</b></td>
			{/if}
		</tr>
		<tr>
			{#if balance}
				<td />
				<td style="width:30px;">

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
				<td style="width:30px;" />
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
						<b>1.04% {$_('month')} </b><img width="25px" src={month} alt="month" />
					</p>
					<p>
						<b>11.8% {$_('year')}</b>
					</p>
				</td>
				<td />
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
					rows="3"
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
				<td style="line-break:auto;" colspan="3">{$_('receive')}</td>
			{/if}
		</tr>
		{#if !contract && !stateValue}
			<tr>
				<td colspan="4" style="text-align:center; padding:50px;">
					<a href="{base}/help">
						<img class={!stateValue ? 'flashing' : ''} width="100px" src={help} alt="help" />
					</a>
				</td>
			</tr>
		{/if}
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
		background-color: white;
    border-radius: 60px;
	}
	table tr td {
		justify-content: space-around;
	}

	table tr td p {
		font-size: small;
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
		border-radius: 10px;
		background: #f4ffee;
		border-width: 5px;
		font-weight: 500;
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
		box-shadow: inset 2px 2px 3px rgba(255, 255, 255, 0.6), inset -2px -2px 3px rgba(0, 0, 0, 0.6);
	}

	.styled:hover {
		background-color: rgb(255, 184, 54);
	}

	.styled:active {
		box-shadow: inset -2px -2px 3px rgba(255, 255, 255, 0.6), inset 2px 2px 3px rgba(0, 0, 0, 0.6);
	}

	.flashing {
		animation: blinker 3s linear infinite;
	}

	@keyframes blinker {
		50% {
			opacity: 0.2;
		}
	}
</style>
