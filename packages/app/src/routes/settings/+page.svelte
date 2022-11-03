<script lang="ts">
	import { executorAddress, chaingraphHost, protocol, node } from '$lib/store.js';

	let executorAddressValue: string;
	let chaingraphHostValue: string;
	let nodeValue: string;
	let protocolValue: string;

	chaingraphHost.subscribe((value) => {
		chaingraphHostValue = value;
	});
	executorAddress.subscribe((value) => {
		executorAddressValue = value;
	});
	node.subscribe((value) => {
		nodeValue = value;
	});
	protocol.subscribe((value) => {
		protocolValue = value;
	});

	function updateChaingraphHost() {
		chaingraphHost.set(chaingraphHostValue);
	}

	function updateExAddress() {
		executorAddress.set(executorAddressValue);
	}
	function updateNode() {
		node.set(nodeValue);
	}
	function updateProtocol() {
		protocol.set(protocolValue);
	}
</script>

<svelte:head>
	<title>Settings</title>
	<meta name="description" content="Settings" />
</svelte:head>

<div>
	<span>
		<h1>Settings</h1>

		<h2>Executor Address</h2>
		<label for="executorAddressValue">Cash address to recieve executor fees</label>
		<input on:change={updateExAddress} bind:value={executorAddressValue} style="width: 100%" />
		<hr />
		<h2>Unspent Output Index</h2>

		<label for="protocol">Protocol filter</label>
		<input on:change={updateProtocol} bind:value={protocolValue} style="width: 100%" /><br />

		<label for="host">Chaingraph Index service</label>
		<input on:change={updateChaingraphHost} bind:value={chaingraphHostValue} style="width: 100%" />

		<label for="node">Node type</label>
		<input on:change={updateNode} bind:value={nodeValue} style="width: 100%" />
	</span>
</div>

<style>
	h2 {
		font-weight: bold;
	}
	input {
		align-items: center;
		justify-content: left;
		text-align: left;
		box-sizing: border-box;
		text-transform: lowercase;
		border: none;
		font-size: calc(0.08 * var(--width));
		border-radius: 2px;
		background: white;
		margin: 0;
		color: rgba(0, 0, 0, 0.7);
	}
</style>
