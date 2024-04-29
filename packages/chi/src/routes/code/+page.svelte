<script>
	import { beforeUpdate } from 'svelte';
	import { Perpetuity } from '@unspent/phi';
	import Prism from 'prismjs';
	import { binToHex } from '@bitauth/libauth';
	import { scriptToBytecode } from '@cashscript/utils';
	import { receiptAddressStore } from '$lib/store.js';
	import { copy } from 'svelte-copy';
	import { toast } from '@zerodevx/svelte-toast';

	let receiptAddress = '';
	let series = [];
	let contract;

	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
	});

	beforeUpdate(async () => {
		if (receiptAddress) {
			contract = new Perpetuity(4383, receiptAddress, 1500, 96);
		}
	});
</script>

{#if contract}
	<div style=" align-self:center">
		<h3>Links</h3>
		<div>
			<a href="https://unspent.app/contract?opReturn={binToHex(contract.toOpReturn())}">
				unspent.app</a
			>
		</div>
		<h3>Unspent Command</h3>

		<div class="hex">
			<p>
				The <a
					style="font-family:monospace"
					target="_blank"
					href="https://www.npmjs.com/package/unspent">unspent</a
				> command to call this contract from the command line:
			</p>
			<div
				use:copy={contract.asCommand()}
				on:svelte-copy={(e) => toast.push('OK 📋🗸: ' + e.detail)}
				on:svelte-copy:error={(event) =>
					toast.push(`Error, no access to clipboard?: ${event.detail.message}`, {
						classes: ['warn']
					})}
			>
				<div>
					<button class="mono">
						{contract.asCommand()}
					</button>
				</div>
			</div>
		</div>

		<h3>Unspent Phi Protocol (string)</h3>

		<div class="hex">
			<p>A human readable record of this contract:</p>
			<div
				use:copy={contract.toString()}
				on:svelte-copy={(e) => toast.push('OK 📋🗸: ' + e.detail)}
				on:svelte-copy:error={(event) =>
					toast.push(`Error, no access to clipboard?: ${event.detail.message}`, {
						classes: ['warn']
					})}
			>
				<div class="action">
					<button class="mono">
						{contract.toString()}
					</button>
				</div>
			</div>
		</div>

		<h3>Unspent Phi Protocol (op_return)</h3>

		<div class="hex">
			<p>A record of this contract encoded for inclusion as an OP_RETURN message.</p>
			<div
				use:copy={contract.toOpReturn()}
				on:svelte-copy={(e) => toast.push('OK 📋🗸: ' + e.detail)}
				on:svelte-copy:error={(event) =>
					toast.push(`Error, no access to clipboard?: ${event.detail.message}`, {
						classes: ['warn']
					})}
			>
				<div class="action">
					<button class="mono">
						{binToHex(contract.toOpReturn())}
					</button>
				</div>
			</div>
		</div>

		{#if contract.contract.redeemScript}
			<h3>Redeem Script Hex</h3>
			<div class="hex">
				<p>
					Hex code containing the contract parameters and unlocking script for independent
					verification in a <a target="_blank" href="https://explorer.bitcoinunlimited.info/decoder"
						>decoder</a
					>
				</p>
				<div
					use:copy={binToHex(scriptToBytecode(contract.contract.redeemScript))}
					on:svelte-copy={(e) => toast.push('OK 📋🗸: ' + e.detail)}
					on:svelte-copy:error={(event) =>
						toast.push(`Error, no access to clipboard?: ${event.detail.message}`, {
							classes: ['warn']
						})}
				>
					<div class="action">
						<button class="mono" on:click={copy}>
							{binToHex(scriptToBytecode(contract.contract.redeemScript))}
						</button>
					</div>
				</div>
			</div>
		{/if}
		<h3>Unlocking Bytecode</h3>
		<div class="bytecode">
			{@html Prism.highlight(contract.artifact.bytecode, Prism.languages['javascript'])}
		</div>
		<h3>CashScript</h3>
		<div class="code">
			{@html Prism.highlight(contract.artifact.source, Prism.languages['javascript'])}
		</div>
	</div>
{:else}
	No contract
{/if}

<style>
	a {
		font-weight: 700;
		color: #2f006c;
	}
	.mono {
		font-family: monospace;
		background-color: rgb(255, 255, 255);
		border-radius: 5px;
		padding: 5px;
		box-shadow: inset 2px 2px 3px rgba(255, 255, 255, 0.6), inset -2px -2px 3px rgba(0, 0, 0, 0.6);
	}
	.bytecode {
		font-size: small;
		overflow-x: scroll;
		white-space: pre-wrap;
	}
	.code {
		font-size: small;
		overflow-x: scroll;
		white-space: pre-line;
	}
	.hex {
		font-size: small;
		line-break: anywhere;
	}
</style>
