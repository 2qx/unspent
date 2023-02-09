<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import Prism from 'prismjs';
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
	import { Svg } from '@smui/common';

	import { Confetti } from 'svelte-confetti';
	import BroadcastAction from '$lib/BroadcastAction.svelte';
	import UtxosSelect from '$lib/UtxosSelect.svelte';
	import { load } from '$lib/machinery/loader-store.js';
	import { executorAddress } from './store.js';
	import Address from './Address.svelte';
	import AddressQrDialog from './AddressQrDialog.svelte';
	import AddressBlockie from './AddressBlockie.svelte';
	import ContractChart from './ContractChart.svelte';
	import SerializedString from './SerializedString.svelte';

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

	let executorAddressValue = '';

	executorAddress.subscribe((value) => {
		executorAddressValue = value;
	});

	beforeUpdate(async () => {
		// This fixes a bug related to the contract switch where old contracts appear
		if (instanceType && instanceType !== instance.artifact.contractName) instance = undefined;
		await updateBalance();
		legacyAddress = await instance.getLegacyAddress();
	});

	const updateBalance = async () => {
		await load({
			load: async () => {
				if (instance) balance = await instance.getBalance();
				isFunded = balance > 0 ? true : false;

				if (instance.contract.name === 'Annuity' || instance.contract.name === 'Perpetuity') {
					if (showSeries) {
						updateSeries();
					}
				}
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

	const updateSeries = async () => {
		await load({
			load: async () => {
				// only update the series when the contract changes
				if (cachedAddress != instance.getAddress()) {
					series = await instance.asSeries();
					cachedAddress = instance.getAddress();
				}
			}
		});
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
    <span style="position: relative; display: inline-block; padding: .5em .5em 0 0;">
      <div style="font-size: x-large;">{instance.artifact.contractName}</div>
      <Badge color="secondary" square align="top-end" aria-label="contract version">v{instance.options.version}</Badge>
    </span>
	</div>

	<div>
		<p>{instance.asText()}</p>
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
				href="{base}/contract?opReturn={instance.toOpReturn(true)}"
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

		<Wrapper>
			<IconButton
				href="https://explorer.bitcoinunlimited.info/address/{instance.getAddress()}"
				target="_blank"
				touch
				color="secondary"
				size="button"
			>
				<Icon class="material-icons">travel_explore</Icon>
			</IconButton>
			<Tooltip>View on block explorer</Tooltip>
		</Wrapper>
		<Wrapper>
			<IconButton
				href="https://blockchair.com/bitcoin-cash/address/{instance.getAddress()}"
				target="_blank"
				touch
				color="secondary"
				size="button"
				ripple={false}
			>
				<Icon component={Svg} viewBox="2 2 22 22">
					<path
						fill="currentColor"
						d="m 12.986211,23.033985 5.306349,-3.303844 v -6.74658 c 0,-0.131639 -0.0234,-0.257971 -0.06294,-0.378921 l -5.360329,3.337034 c 0.07554,0.179108 0.116921,0.374437 0.116921,0.57597 z"
					/>
					<path
						fill="currentColor"
						d="M 11.816937,0.94789702 6.5105653,4.251752 v 6.746527 c 0,0.131714 0.023384,0.258047 0.062957,0.378996 L 11.933857,8.0402403 c -0.07555,-0.1791822 -0.11692,-0.3744512 -0.11692,-0.576014 z"
					/>
					<path
						fill="currentColor"
						d="M 12.11283,8.3501649 6.7354072,11.698787 c 0.090838,0.127229 0.2077579,0.238311 0.3462634,0.325249 l 5.2074414,3.242024 c 0.158289,0.09852 0.293195,0.223062 0.401123,0.366363 l 5.378291,-3.347725 c -0.09082,-0.127229 -0.207737,-0.238311 -0.346254,-0.325174 L 12.514858,8.7174249 C 12.355665,8.6180039 12.221655,8.4934658 12.11283,8.3501649 Z"
					/>
					<path fill="currentColor" d="m 11.816974,23.033985 v -5.986868 l -4.7910241,3.00461 z" />
				</Icon>
			</IconButton>
			<Tooltip>View on BlockChair</Tooltip>
		</Wrapper>

		<Wrapper>
			<IconButton
				href="https://bitinfocharts.com/bitcoin%20cash/address/{legacyAddress}"
				target="_blank"
				touch
				color="secondary"
				size="button"
			>
				<Icon class="material-icons">egg</Icon>
			</IconButton>
			<Tooltip>View on BitInfoCharts</Tooltip>
		</Wrapper>
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

	{#if !executorAddressValue}
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
		<div id="errorConsole">{executeError}</div>
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
				<pre>{ts.id}</pre>
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
				<Button style="height:fit-content;" touch color="secondary"  variant="outlined">
					<Icon class="material-icons">lock</Icon>
					<Label>{instance.getLockingBytecode()}</Label>
				</Button>
				<Tooltip>Locking Bytecode</Tooltip>
			</Wrapper>
		</div>
		<h3>Phi Contract Parameters</h3>

		<p>
			Unspent Phi contracts may be serialized as a comma seperated string, or, in OP_RETURN data
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
								href="{base}/explorer?lockingBytecode={output} "
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
  #errorConsole {
    white-space: pre-wrap; 
    font-family:'Courier New', Courier, monospace; 
    background-color:#f4e6e6;
    font-size: small;
    padding: 10px;
  }
</style>
