<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { base } from '$app/paths';
  import { hexToBin, lockingBytecodeToCashAddress } from '@bitauth/libauth';
	import Button, { Label, Icon } from '@smui/button';
	import CircularProgress from '@smui/circular-progress';

	import { Confetti } from 'svelte-confetti';
	import BroadcastAction from '$lib/BroadcastAction.svelte';
	import UtxosSelect from '$lib/UtxosSelect.svelte';
	import { load } from '$lib/machinery/loader-store.js';
	import { executorAddress } from './store.js';
	import Address from './Address.svelte';
	import AddressQrCode from './AddressQrCode.svelte';
	import AddressBlockie from './AddressBlockie.svelte';
	import ContractChart from './ContractChart.svelte';
	import SerializedString from './SerializedString.svelte';

	export let instance: any;
	export let instanceType = '';
	let balance = NaN;
	let txid = '';
	let opReturnHex = '';
	let utxos: any = [];
  let series: any;
	let isFunded = false;
	let outputs: string[] = [];

	let executionProgress = 0;
	let executionProgressId;
	let executionProgressClosed = true;
	let executedSuccess = false;
	let executeError = '';

	let executorAddressValue = '';

	executorAddress.subscribe((value) => {
		executorAddressValue = value;
	});

	beforeUpdate(async () => {
		// This fixes a bug related to the contract switch where old contracts appear
		if (instanceType && instanceType !== instance.artifact.contractName) instance = undefined;
		await updateBalance();
	});

	const updateBalance = async () => {
		await load({
			load: async () => {
				if (instance) balance = await instance.getBalance();
				isFunded = balance > 0 ? true : false;
			}
		});
	};

	const execute = async () => {
		await load({
			load: async () => {
				setProgress();
				executedSuccess = false;
				try {
					let inUtxos = utxos.filter((u: any) => u.use == true);
					txid = await instance.execute(executorAddressValue, undefined, inUtxos);
					executedSuccess = true;
					executeError = '';
					clearProgress();
				} catch (e) {
					executeError = e;
					clearProgress();
				}
			}
		});
	};

	const getUtxos = async () => {
		await load({
			load: async () => {
				utxos = await instance.getUtxos();
				utxos = utxos.map((u: any) => {
					u.key = u.txid + ':' + u.vout;
					u.use = true;
					return u;
				});
			}
		});
	};

	function dropUtxos() {
		utxos = [];
	}


  const getSeries = async () => {
		await load({
			load: async () => {
				series = await instance.asSeries();
        console.log(series, undefined, 2)
			}
		});
	};

	function dropSeries() {
		series = [];
	}


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
</script>

{#if instance}
	<h1>{instanceType}</h1>
	<p>{instance.asText()}</p>

	<a href="{base}/contract?opReturn={instance.toOpReturn(true)}" target="_blank">Permalink</a>

	<h2>Locking Bytecode</h2>
  <p>Cashaddress:</p>
	<p><Address address={instance.getAddress()} /></p>
	<div>
		<AddressQrCode codeValue={instance.getAddress()} />
    <AddressBlockie lockingBytecode={instance.getLockingBytecode()} />
	</div>


	<p>Hex:</p>

	<pre>{instance.getLockingBytecode()}</pre>

	<h2>Unlocking Bytecode</h2>
	<h3>Phi Contract Parameters</h3>

	<BroadcastAction opReturnHex={instance.toOpReturn(true)} />

	<p>Serialized String: <SerializedString str={instance.toString()} /></p>
	<p>Serialized OpReturn:</p>
	<pre>{instance.toOpReturn(true)}</pre>

	{#if instance.getOutputLockingBytecodes().length > 0}
		<h3>Predefined outputs:</h3>
    <table>
      {#each instance.getOutputLockingBytecodes() as output}
			<tr>
				<td class="right"><a style="max-width=30em; line-break:anywhere;" href="{base}/explorer?lockingBytecode={output} "> {output} </a> </td>
				<td> <AddressBlockie size={30} lockingBytecode={output} /> </td>
			</tr>
      <tr>
        <td colspan="2">
         <Address address={lockingBytecodeToCashAddress(hexToBin(output),'bitcoincash')}/>
        </td>
      </tr>
		{/each}
    </table>
	{/if}
	<h2>Unspent Transaction Outputs</h2>

	<p>Balance {balance} sats <button on:click={updateBalance}>Update</button></p>

	<br />
	Inputs
	{#if utxos.length == 0}
		<button on:click={getUtxos}>Select Inputs</button>
	{/if}
	{#if utxos.length > 0}
		<button on:click={dropUtxos}>Use All Unspent Outputs (default)</button>
		<UtxosSelect bind:utxos />
	{/if}
	<br />
  <h2>Schedule</h2>
  {#if !series }
		<button on:click={getSeries}>Load Schedule</button>
	{/if}
	{#if series && Object.keys(series).length > 0}
		<button on:click={dropSeries}>Hide</button>
		<ContractChart bind:series/>
	{/if}
  
	<h2>Unlock</h2>
	<Button variant="raised" touch on:click={execute}>
		<Label>Execute</Label>
		<Icon class="material-icons">lock_open</Icon>
	</Button>

	{#if !executorAddressValue}
		<p><b>No cashaddress specified, your executor fees will go to miners.</b></p>
	{/if}
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
	{#if executedSuccess}
		{#if txid}
			<div style="display: flex; justify-content: center">
				<Confetti colorRange={[75, 175]} />
			</div>
			<div style="max-width=30em; line-break:anywhere;">
				<a style="max-width=30em; line-break:anywhere;" href="{base}/explorer?tx={txid}">{txid}</a>
			</div>
		{/if}
	{/if}
{/if}
