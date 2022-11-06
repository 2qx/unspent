<script lang="ts">
  import { onMount } from 'svelte';
  import { hexToBin, decodeTransaction } from '@bitauth/libauth'; 
  import { load } from '$lib/machinery/loader-store.js';
	import { getTransaction } from '@unspent/phi';

	import { chaingraphHost } from '$lib/store.js';

	export let txid;
	let transaction;
  let txObject;
	let chaingraphHostValue = '';

	chaingraphHost.subscribe((value) => {
		chaingraphHostValue = value;
	});

  onMount(async () => {
		if (chaingraphHostValue.length > 0) {
			loadTx();
		}
	});

  const loadTx = async () => {
		await load({
			load: async () => {
				transaction = (await getTransaction(chaingraphHostValue, txid))["transaction"].pop();
        txObject = decodeTransaction(hexToBin(transaction.encoded_hex));
			}
		});
	};

	
</script>

{#if txObject}

<pre>
  {JSON.stringify(txObject, undefined, 2)}
</pre>
	
{/if}
<br>
{#if transaction}

<pre>
  {JSON.stringify(transaction, undefined, 2)}
</pre>
	
{/if}
