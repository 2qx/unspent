<script lang="ts">
	import { base } from '$app/paths';
	import Card from '@smui/card';
	import IconButton, { Icon } from '@smui/icon-button';
	import Radio from '@smui/radio';
	import FormField from '@smui/form-field';
	import { toast } from '@zerodevx/svelte-toast';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import Tooltip, { Wrapper } from '@smui/tooltip';
	import AddressQrDialog from '$lib/AddressQrDialog.svelte';
	import { deriveLockingBytecodeHex, sanitizeAddress } from '@unspent/phi';
	import AddressBlockie from '$lib/AddressBlockie.svelte';
	import {
		executorAddress,
		executorChipnetAddress,
		chaingraphHost,
		protocol,
		node,
		explorer,
		chipnetExplorer
	} from '$lib/store.js';

	let executorAddressValue: string;
	let executorChipnetAddressValue: string;

	let lockingBytecode: string;
	let chipnetLockingBytecode: string;

	let chaingraphHostValue: string;
	let nodeValue: string;
	let protocolValue: string;

	let explorerValue: string;
	let chipnetExplorerValue: string;

	let nodeOptions = [
		{
			name: 'mainnet',
			disabled: false
		},
		{
			name: 'chipnet',
			disabled: false
		}
	];

	chaingraphHost.subscribe((value) => {
		chaingraphHostValue = value;
	});
	executorAddress.subscribe((value) => {
		executorAddressValue = value;
		if (executorAddressValue) {
			try {
				lockingBytecode = deriveLockingBytecodeHex(executorAddressValue);
			} catch {
				console.error('error decoding provided cashaddr, in settings.');
			}
		}
	});

  executorChipnetAddress.subscribe((value) => {
		executorChipnetAddressValue = value;
		if (executorChipnetAddressValue) {
			try {
				chipnetLockingBytecode = deriveLockingBytecodeHex(executorChipnetAddressValue);
			} catch {
				console.error('error decoding provided chipnet cashaddr, in settings.');
			}
		}
	});

	node.subscribe((value) => {
		nodeValue = value;
	});

	protocol.subscribe((value) => {
		protocolValue = value;
	});

	chipnetExplorer.subscribe((v) => {
		chipnetExplorerValue = v;
	});

	explorer.subscribe((v) => {
		explorerValue = v;
	});

	function updateChaingraphHost() {
		chaingraphHost.set(chaingraphHostValue);
	}

	function clearExAddress() {
		lockingBytecode = '';
		executorAddressValue = '';
		executorAddress.set('');
	}

	function clearExChipnetAddress() {
		chipnetLockingBytecode = '';
		executorChipnetAddressValue = '';
		executorChipnetAddress.set('');
	}

	async function updateExAddress() {
		let sanitizedAddress;
		try {
			sanitizedAddress = await sanitizeAddress(executorAddressValue);
		} catch (e: any) {
			sanitizedAddress = '';
			if (e.message) {
				toast.push(e.message, { classes: ['warn'] });
			} else {
				toast.push(e, { classes: ['warn'] });
			}
		}

		if (sanitizedAddress) {
			try {
				lockingBytecode = deriveLockingBytecodeHex(sanitizedAddress);

				executorAddress.set(sanitizedAddress);
			} catch (e: any) {
				if (e.message) {
					toast.push(e.message, { classes: ['warn'] });
				} else {
					toast.push(e, { classes: ['warn'] });
				}
			}
		} else {
			lockingBytecode = '';
		}
	}

	async function updateExChipnetAddress() {
		let sanitizedAddress;
		try {
			sanitizedAddress = await sanitizeAddress(executorChipnetAddressValue);
		} catch (e: any) {
			sanitizedAddress = '';
			if (e.message) {
				toast.push(e.message, { classes: ['warn'] });
			} else {
				toast.push(e, { classes: ['warn'] });
			}
		}

		if (sanitizedAddress) {
			try {
				chipnetLockingBytecode = deriveLockingBytecodeHex(sanitizedAddress);

				executorChipnetAddress.set(sanitizedAddress);
			} catch (e: any) {
				if (e.message) {
					toast.push(e.message, { classes: ['warn'] });
				} else {
					toast.push(e, { classes: ['warn'] });
				}
			}
		} else {
			chipnetLockingBytecode = '';
		}
	}

	function updateNode() {
		node.set(nodeValue);
	}

	function updateExplorer() {
		explorer.set(explorerValue);
	}

	function updateChipnetExplorer() {
		chipnetExplorer.set(chipnetExplorerValue);
	}

	function updateProtocol() {
		protocol.set(protocolValue);
	}
</script>

<svelte:head>
	<title>Settings</title>
	<meta name="description" content="Settings" />
</svelte:head>
<div class="card-display">
	<div class="card-container">
		<Card class="demo-spaced">
			<div class="margins">
				<h1>Settings</h1>
				<hr />
				{#if nodeValue == 'mainnet'}
					<h2>Executor Cash Address</h2>
					<div>
						<Textfield
							bind:value={executorAddressValue}
							on:change={updateExAddress}
							style="width: 100%;"
							helperLine$style="width: 100%;"
							label="Cash address to recieve executor fees"
						>
							<HelperText slot="helper">bitcoincash:q4j3j6j...</HelperText>
						</Textfield>
						<div style="display: flex; align-items: center;">
							<IconButton class="material-icons" on:click={clearExAddress}>delete</IconButton>
							{#if lockingBytecode}
								<Wrapper style="float:right">
									<AddressQrDialog codeValue={executorAddressValue} />
									<Tooltip>Show qr code</Tooltip>
								</Wrapper>
							{/if}
						</div>
					</div>
					{#if lockingBytecode}
						<div>
							<AddressBlockie {lockingBytecode} />
						</div>
						<p>Locking Bytecode</p>
						<a style="line-break:anywhere;" href="{base}/explorer?lockingBytecode={lockingBytecode}"
							>{lockingBytecode}</a
						>
					{/if}
				{:else}
					<h2>Executor Chipnet Cash Address</h2>
					<div>
						<Textfield
							bind:value={executorChipnetAddressValue}
							on:change={updateExChipnetAddress}
							style="width: 100%;"
							helperLine$style="width: 100%;"
							label="Chipnet address to receive executor fees"
						>
							<HelperText slot="helper">bchtest:q4j3j6j...</HelperText>
						</Textfield>
						<div style="display: flex; align-items: center;">
							<IconButton class="material-icons" on:click={clearExChipnetAddress}>delete</IconButton
							>
							{#if chipnetLockingBytecode}
								<Wrapper style="float:right">
									<AddressQrDialog codeValue={executorChipnetAddressValue} />
									<Tooltip>Show qr code</Tooltip>
								</Wrapper>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</Card>
	</div>
</div>

<div class="card-display">
	<div class="card-container">
		<Card class="demo-spaced">
			<div class="margins">
				<h2>Unspent Contract Index</h2>
				<div>
					<Textfield
						bind:value={chaingraphHostValue}
						on:change={updateChaingraphHost}
						style="width: 100%;"
						helperLine$style="width: 100%;"
						label="Chaingraph Service"
					>
						<HelperText slot="helper">https://... chaingraph host... /v1/graphql</HelperText>
					</Textfield>
				</div>
				<div>
					<Textfield on:change={updateProtocol} bind:value={protocolValue} label="Protocol">
						<HelperText slot="helper">Protocol filter</HelperText>
					</Textfield>
				</div>
			</div>
		</Card>
	</div>
</div>

<div class="card-display">
	<div class="card-container">
		<Card class="demo-spaced">
			<div class="margins">
				<h2>Default Explorer</h2>
				{#if nodeValue == 'mainnet'}
					<div>
						<Textfield
							bind:value={explorerValue}
							on:change={updateExplorer}
							style="width: 100%;"
							helperLine$style="width: 100%;"
							label="Explorer"
						>
							<HelperText slot="helper">Explorer</HelperText>
						</Textfield>
					</div>
				{:else}
					<div>
						<Textfield
							on:change={updateChipnetExplorer}
							bind:value={chipnetExplorerValue}
							style="width: 100%;"
							helperLine$style="width: 100%;"
							label="Chipnet Explorer"
						>
							<HelperText slot="helper">Chipnet Explorer</HelperText>
						</Textfield>
					</div>
				{/if}
			</div>
		</Card>
	</div>
</div>

<div class="card-display">
	<div class="card-container">
		<Card class="demo-spaced">
			<div class="margins">
				<h2>Network</h2>
				<p>This app may be used in against mainnet or testnet</p>
				<div class="radio-demo">
					{#each nodeOptions as nodeOption}
						<FormField>
							<Radio on:change={updateNode} bind:group={nodeValue} value={nodeOption.name} touch />
							<span slot="label">{nodeOption.name}</span>
						</FormField>
					{/each}
				</div>
			</div>
		</Card>
	</div>
</div>

<style>
	* :global(.margins) {
		margin: 18px 10px 24px;
	}

	* :global(.columns) {
		display: flex;
		flex-wrap: wrap;
	}

	* :global(.columns > *) {
		flex-basis: 0;
		min-width: 245px;
		margin-right: 12px;
	}
	* :global(.columns > *:last-child) {
		margin-right: 0;
	}

	* :global(.columns .mdc-text-field),
	* :global(.columns .mdc-text-field + .mdc-text-field-helper-line) {
		width: 218px;
	}

	* :global(.columns .status) {
		width: auto;
		word-break: break-all;
		overflow-wrap: break-word;
	}
</style>
