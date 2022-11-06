<script lang="ts">
import { onMount } from 'svelte';
  import { load } from '$lib/machinery/loader-store.js';
	import { getLockingBytecode } from '@unspent/phi';

	import { chaingraphHost } from '$lib/store.js';

	export let lockingBytecode;
	let result;
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
				result = await getLockingBytecode(chaingraphHostValue, lockingBytecode);
			}
		});
	};

</script>


{#if lockingBytecode}
<pre>
	{JSON.stringify(result, undefined, 2)}
</pre>

{/if}