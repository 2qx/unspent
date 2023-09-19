<script>
	import { beforeUpdate } from 'svelte';
	import { Perpetuity } from '@unspent/phi';
  import Prism from 'prismjs';
  import { binToHex } from '@bitauth/libauth';
  import { scriptToBytecode } from '@cashscript/utils';
	import { receiptAddressStore } from '$lib/store.js';
	import { stringify } from 'querystring';

	let receiptAddress = '';
	let series = [];
	let contract;

	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
	});

	beforeUpdate(async () => {
		if (receiptAddress) {
			contract = new Perpetuity(4383, receiptAddress, 1500, 96);
      
			if (contract) await loadSeries();
		}
	});

	const loadSeries = async () => {
		series = await contract.asSeries();
	};
</script>

{#if contract}
<h3>Redeem Script Hex</h3>
<div class="hex">
  {#if contract.contract.redeemScript}
  {@html Prism.highlight(binToHex(scriptToBytecode(contract.contract.redeemScript)), Prism.languages['javascript'])}
  {/if}
  <br>
  <a target=_blank href="https://explorer.bitcoinunlimited.info/decoder">decoder</a>
</div>
<h3>Unlocking Bytecode</h3>
<div class="bytecode">
  {@html Prism.highlight(contract.artifact.bytecode, Prism.languages['javascript'])}
</div>
<h3>CashScript</h3>
	<div class="code">
		{@html Prism.highlight(contract.artifact.source, Prism.languages['javascript'])}
	</div>



	


{:else}
	No contract
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
  .hex {
		font-size: small;
    line-break: anywhere;
	}
</style>