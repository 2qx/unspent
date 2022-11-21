<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import { base } from '$app/paths';
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
	import SerializedString from './SerializedString.svelte';
	
	export let instance: any;
	export let instanceType = '';
	let balance = NaN;
	let txid = '';
	let opReturnHex = '';
	let utxos: any = [];
	let isFunded = false;

  let executionProgress = 0;
  let executionProgressId;
  let executionProgressClosed = true;
	let executedSucess = false;
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
				if (balance > 0) isFunded = true;
			}
		});
	};

	const execute = async () => {
		await load({
			load: async () => {
        setProgress()
				executedSucess = false;
				try {
					let inUtxos = utxos.filter((u: any) => u.use == true);
					txid = await instance.execute(executorAddressValue, undefined, inUtxos);
					executedSucess = true;
					executeError = '';
          clearProgress()
				} catch (e) {
					executeError = e;
          clearProgress()
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

  function setProgress() {
    executionProgress = 0;
    executionProgressClosed = false;
  
    executionProgressId = setInterval(() => {
      executionProgress += 0.01;
      console.log(executionProgress)
    }, 100);
  }

  function clearProgress(){
    executionProgressClosed = true;
    clearTimeout(executionProgressId)
  }

</script>

{#if instance}
	<h1>{instanceType}</h1>
	<p>{instance.asText()}</p>
	<h2>Locking Bytecode</h2>
	<div>
		<AddressBlockie lockingBytecode={instance.getLockingBytecode()} />
		<AddressQrCode codeValue={instance.getAddress()} />
	</div>

	<h3>Hex code:</h3>
	<p>
		<a
			style="line-break:anywhere;"
			href="{base}/explorer?lockingBytecode={instance.getLockingBytecode()}"
			>{instance.getLockingBytecode()}</a
		>
	</p>
	<p>Cashaddress: <Address address={instance.getAddress()} /></p>

	<h2>Unlocking Bytecode</h2>
	<h3>Phi Contract Parameters</h3>
	<p>String: <SerializedString str={instance.toString()} /></p>
	<p>
		OpReturn: <BroadcastAction opReturnHex={instance.toOpReturn(true)}>Broadcast</BroadcastAction>
	</p>

	<a href="{base}/contract?opReturn={instance.toOpReturn(true)}">Share Link</a>
	<h2>Unspent Transaction Outputs</h2>

	<p>Balance {balance} sats <button on:click={updateBalance}>Update</button></p>
	<br />
	{#if isFunded}
		Inputs
		{#if utxos.length == 0}
			<button on:click={getUtxos}>Select Inputs</button>
		{/if}
		{#if utxos.length > 0}
			<button on:click={dropUtxos}>Use All Unspent Outputs (default)</button>
			<UtxosSelect bind:utxos />
		{/if}
		<br />
		<h2>Unlock</h2>
		<Button variant="raised" touch on:click={execute}>
			<Label>Execute</Label>
			<Icon class="material-icons">lock_open</Icon>
		</Button>
		{#if !executorAddressValue}
			<p><b>No cashaddress specified, your executor fees will go to miners.</b></p>
		{/if}
		<div />
    {#if !executionProgressClosed}
    <div style="display: flex; justify-content: center">
      <CircularProgress style="height: 48px; width: 48px;" progress={executionProgress} closed={executionProgressClosed} />
    </div>
    {/if}
		{#if executeError}
			<pre>{executeError}</pre>
		{/if}
		{#if executedSucess}
			{#if txid}
      <div style="display: flex; justify-content: center">
        <Confetti colorRange={[75, 175]} />
      </div>
				
				<a style="line-break:anywhere;" href="{base}/explorer?tx={txid}">{txid}</a>
			{/if}
		{/if}
	{/if}
{/if}

<style>
</style>
