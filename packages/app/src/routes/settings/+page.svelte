<script lang="ts">
	import { base } from '$app/paths';
	import Card from '@smui/card';
  import IconButton, { Icon } from '@smui/icon-button';
  import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import AddressQrDialog from '$lib/AddressQrDialog.svelte';
	import { deriveLockingBytecodeHex, sanitizeAddress } from '@unspent/phi';
	import AddressBlockie from '$lib/AddressBlockie.svelte';
	import { executorAddress, chaingraphHost, protocol, node } from '$lib/store.js';

	let executorAddressValue: string;
	let chaingraphHostValue: string;
	let nodeValue: string;
	let protocolValue: string;
	let lockingBytecode: string;

	chaingraphHost.subscribe((value) => {
		chaingraphHostValue = value;
	});
	executorAddress.subscribe((value) => {
		executorAddressValue = value;
    if(executorAddressValue) {
      try{
        lockingBytecode = deriveLockingBytecodeHex(executorAddressValue);
      }
      catch{
        console.error("error decoding provided cashaddr, in settings.")
      }
    }
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

  function clearExAddress() {
		lockingBytecode = "";
    executorAddressValue = "";
    executorAddress.set("");
	}

	async function updateExAddress() {
    let sanitizedAddress = await sanitizeAddress(executorAddressValue)
		executorAddress.set(sanitizedAddress);
    if(executorAddressValue) {
      try{
        
        lockingBytecode = deriveLockingBytecodeHex(sanitizedAddress);
      }
      catch{
        console.error("error decoding provided cashaddr, in settings.")
      }
    }
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
<div class="card-display">
	<div class="card-container">
		<Card class="demo-spaced">
			<div class="margins">

				  <h1>Settings</h1>
          <hr/>
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
          {#if executorAddressValue}
          <div style="display: flex; align-items: center;">
            <IconButton class="material-icons" on:click={clearExAddress}
              >delete</IconButton
            >
            <Wrapper style="float:right">
              <AddressQrDialog codeValue={executorAddressValue} />
              <Tooltip>Show qr code</Tooltip>
            </Wrapper>
          </div>
          {/if}
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
					<Textfield on:change={updateNode} bind:value={nodeValue} label="Node Filter">
						<HelperText slot="helper" />
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
