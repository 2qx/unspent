<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import Prism from 'prismjs';
	import { Confetti } from 'svelte-confetti';
  import { throttle } from 'throttle-debounce';

	import { toast } from '@zerodevx/svelte-toast';
	import { copy } from 'svelte-copy';
	import { base } from '$app/paths';

	import { hexToBin, lockingBytecodeToCashAddress } from '@bitauth/libauth';

	import Badge from '@smui-extra/badge';
	import Tooltip, { Wrapper } from '@smui/tooltip';
	import Button, { Label, Icon } from '@smui/button';
	import IconButton, { Icon as IconButtonIcon } from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import LinearProgress from '@smui/linear-progress';

	import BroadcastAction from '$lib/BroadcastAction.svelte';
	import UtxosSelect from '$lib/UtxosSelect.svelte';
	import { executorAddress, executorChipnetAddress, node } from '$lib/store.js';
	import Address from '$lib/Address.svelte';
	import AddressQrDialog from '$lib/AddressQrDialog.svelte';
	import AddressBlockie from '$lib/AddressBlockie.svelte';
	import ContractChart from '$lib/ContractChart.svelte';
	import SerializedString from '$lib/SerializedString.svelte';
	import BlockchairAddress from '$lib/addressLinks/BlockchairAddress.svelte';
	import BitInfoChartsAddress from '$lib/addressLinks/BitInfoChartsAddress.svelte';
	import SickPigAddress from '$lib/addressLinks/SickPigAddress.svelte';
	import ErrorConsole from '$lib/ErrorConsole.svelte';

	export let instance: any;
	export let instanceType = '';
	let balance = NaN;
	let txid = '';
	let opReturnHex = '';
	let cachedAddress = '';
	let legacyAddress = '';
	let utxos: any = [];
	let series: any = [];
	let showSeries = false;
	let showDetails = false;
	let isFunded = false;
	let outputs: string[] = [];

	let executionProgress = 0;
	let executionProgressId;
	let executionProgressClosed = true;
	let executedSuccess = false;
	let executeError = '';

	let address = '';
	let nodeValue = '';

	node.subscribe((value) => {
		nodeValue = value;
	});
	if (nodeValue == 'mainnet') {
		executorAddress.subscribe((value) => {
			address = value;
		});
	}
	if (nodeValue == 'chipnet') {
		executorChipnetAddress.subscribe((value) => {
			address = value;
		});
	}


  const throttleUpdate = throttle(3000, async () => {
         await updateBalance();
    });

	beforeUpdate(async () => {
		// This fixes a bug related to the contract switch where old contracts appear
		if (instanceType && instanceType !== instance.artifact.contractName) instance = undefined;
    await throttleUpdate();
	});

	const updateBalance = async () => {
    
		if (instance) balance = await instance.getBalance();
		isFunded = balance > 0 ? true : false;

		if (instance.contract.name === 'Annuity' || instance.contract.name === 'Perpetuity') {
			if (showSeries) {
				updateSeries();
			}
		}
	};

	const execute = async () => {
		setProgress();
		executedSuccess = false;
		try {
			let inUtxos = utxos.filter((u: any) => u.use == true);
			txid = await instance.execute(address, undefined, inUtxos);
			executedSuccess = true;
			executeError = '';
			clearProgress();
		} catch (e: any) {
			executeError = e;
			clearProgress();
		}
	};

	const getUtxos = async () => {
		utxos = await instance.getUtxos();
		utxos = utxos.map((u: any) => {
			u.key = u.txid + ':' + u.vout;
			u.use = true;
			return u;
		});
	};

	function dropUtxos() {
		utxos = [];
	}

	const updateSeries = async () => {
		// only update the series when the contract changes
		if (cachedAddress != instance.getAddress()) {
			series = await instance.asSeries();
			cachedAddress = instance.getAddress();
		}
	};

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

	function toggleSeries() {
		showSeries = !showSeries;
		if (!showSeries) series = [];
	}

	function toggleDetails() {
		showDetails = !showDetails;
	}
</script>

{#if instance}
	<span style="float:right">
		<BroadcastAction opReturnHex={instance.toOpReturn(true)} />
		<br />
		<AddressBlockie lockingBytecode={instance.getLockingBytecode()} />
	</span>
	<div>
		<span style="position: relative; display: inline-block; padding: 1em 1em 0 0;">
			<div style="font-size: x-large;">{instance.artifact.contractName}</div>
			<Badge color="secondary" square align="top-end" aria-label="contract version"
				>v{instance.options.version}</Badge
			>
      <Badge color="primary"  position="outset" align="bottom-end" aria-label="contract network"
				>{nodeValue}</Badge
			>
		</span>
	</div>

	<div>
    <span style="padding: 1em;">
		<p>{instance.asText()}</p>
  </span>
	</div>
	<div style=" width: 200px;">
		<div style="text-align:end;">
			<b>{balance.toLocaleString()}</b> sats
			<Wrapper>
				<IconButton on:click={updateBalance} size="button">
					<IconButtonIcon class="material-icons">refresh</IconButtonIcon>
				</IconButton>
				<Tooltip>Refresh Balance</Tooltip>
			</Wrapper>
		</div>
	</div>
	<br />
	<div>
		<Wrapper>
			<IconButton
				href="{base}/contract?opReturn={instance.toOpReturn(true)}&network={instance.options
					.network}"
				target="_blank"
				touch
				color="secondary"
				size="button"
			>
				<Icon class="material-icons">launch</Icon>
			</IconButton>
			<Tooltip>Open permanent link in new tab</Tooltip>
		</Wrapper>

		<Wrapper>
			<AddressQrDialog codeValue={instance.getAddress()} />
			<Tooltip>Show qr code</Tooltip>
		</Wrapper>

		<SickPigAddress address={instance.getAddress()} network={nodeValue} />
		{#if nodeValue === 'mainnet'}
			<BlockchairAddress address={instance.getAddress()} />
			<BitInfoChartsAddress {instance} />
		{/if}
	</div>

	<Address address={instance.getAddress()} />

	{#if utxos.length == 0}
		<Wrapper>
			<Button variant="outlined" touch on:click={getUtxos}>
				<Icon class="material-icons">filter_alt</Icon>
				<Label>Inputs</Label>
			</Button>
			<Tooltip>Filter input utxos</Tooltip>
		</Wrapper>
	{/if}
	{#if utxos.length > 0}
		<Wrapper>
			<Button variant="outlined" touch on:click={dropUtxos}>
				<Icon class="material-icons">list</Icon>
				<Label>Use Default</Label>
			</Button>
			<Tooltip>Attempt to spend all inputs</Tooltip>
		</Wrapper>
		<UtxosSelect bind:utxos />
	{/if}

	<Wrapper>
		<Button variant="raised" touch on:click={execute}>
			<Icon class="material-icons">key</Icon>
			<Label>Spend</Label>
		</Button>
		<Tooltip>Execute this Contract</Tooltip>
	</Wrapper>

	{#if !address}
		<p>
			<b>Note:&nbsp;</b>Set an executor address in <a href="{base}/settings">settings</a> to claim execution
			fee.
		</p>
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
		<ErrorConsole errorText={executeError} />
	{/if}
	{#if executedSuccess}
		{#if txid}
			<div style="display: flex; justify-content: center">
				<Confetti colorRange={[75, 175]} />
			</div>
			<div style="max-width=30em; line-break:anywhere;">
				<p>
					<a style="max-width=30em; line-break:anywhere;" href="{base}/explorer?tx={txid}">{txid}</a
					>
				</p>
			</div>
		{/if}
	{/if}
	<br />

	{#if instance.contract.name === 'Annuity' || instance.contract.name === 'Perpetuity'}
		{#if !showSeries}
			<Wrapper>
				<Button variant="outlined" touch on:click={toggleSeries}>
					<Icon class="material-icons">stacked_bar_chart</Icon>
					<Label>Schedule</Label>
				</Button>
			</Wrapper>
		{:else}
			<Wrapper>
				<Button variant="outlined" touch on:click={toggleSeries}>
					<Icon class="material-icons">expand_less</Icon>
					<Label>Close Schedule</Label>
				</Button>
			</Wrapper>
		{/if}
	{/if}

	{#if !showDetails}
		<Wrapper>
			<Button variant="outlined" touch on:click={toggleDetails}>
				<Icon class="material-icons">developer_mode</Icon>
				<Label>Contract Details</Label>
			</Button>
			<Tooltip>Show contract details</Tooltip>
		</Wrapper>
	{:else}
		<Wrapper>
			<Button variant="outlined" touch on:click={toggleDetails}>
				<Icon class="material-icons">expand_less</Icon>
				<Label>Close Contract Details</Label>
			</Button>
		</Wrapper>
	{/if}
	{#if showSeries}
		<p>An optimistic schedule, assuming timely contract execution.</p>

		{#if series && series.length > 0}
			{#each series as ts (ts.id)}
				<pre style="font-size:x-small;">{ts.id}</pre>
				<ContractChart bind:series={ts.data} />
			{/each}
		{:else}
			<p>Building time series</p>
			<LinearProgress indeterminate />
		{/if}
	{/if}
	{#if showDetails}
		<h4>Locking Bytecode:</h4>
		<div
			use:copy={instance.getLockingBytecode()}
			on:svelte-copy={() => toast.push('LockingBytecode Copied')}
		>
			<Wrapper>
				<Button style="height:fit-content;" touch color="secondary" variant="outlined">
					<Icon class="material-icons">lock</Icon>
					<Label>{instance.getLockingBytecode()}</Label>
				</Button>
				<Tooltip>Locking Bytecode</Tooltip>
			</Wrapper>
		</div>
		<h3>Phi Contract Parameters</h3>

		<p>
			Unspent Phi contracts may be serialized as a comma separated string, or, in OP_RETURN data
			format.
		</p>
		<p>
			If contract parameters have been published, or broadcasted, in an OP_RETURN, the data for
			execution are publicly known.
		</p>

		<h4>Serialized String:</h4>
		<SerializedString str={instance.toString()} />
		<h4>Serialized OpReturn:</h4>
		<pre>{instance.toOpReturn(true)}</pre>

		{#if instance.getOutputLockingBytecodes().length > 0}
			<h3>Predefined outputs:</h3>
			<p>This contract sends funds to the following predefined output(s)</p>
			<table>
				{#each instance.getOutputLockingBytecodes() as output}
					<tr>
						<td colspan="2">
							<Address address={lockingBytecodeToCashAddress(hexToBin(output), 'bitcoincash')} />
						</td>
					</tr>
					<tr>
						<td class="right"
							><a
								style="max-width=30em; line-break:anywhere;"
								href="{base}/explorer?lockingBytecode={output}&network={nodeValue}"
							>
								{output}
							</a>
						</td>
						<td> <AddressBlockie size={30} lockingBytecode={output} /> </td>
					</tr>
				{/each}
			</table>
		{/if}
		{#if instance.artifact}
			<h3>Unlocking Bytecode</h3>
			<div class="bytecode">
				{@html Prism.highlight(instance.artifact.bytecode, Prism.languages['javascript'])}
			</div>
			<h3>CashScript</h3>
			<div class="code">
				{@html Prism.highlight(instance.artifact.source, Prism.languages['javascript'])}
			</div>
		{/if}
	{/if}
{/if}

<style>
	.bytecode {
		font-size: small;
		overflow-x: scroll;
		white-space: pre-wrap;
	}
	.code {
		font-size: small;
		overflow-x: scroll;
		white-space: pre;
	}
	/* #errorConsole {
		white-space: pre-wrap;
		overflow: scroll;
		font-family: 'Courier New', Courier, monospace;
		background-color: #f4e6e6;
		font-size: small;
		padding: 10px;
	} */
</style>
