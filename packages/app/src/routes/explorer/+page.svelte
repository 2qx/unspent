<script lang="ts">
	import { load } from '$lib/machinery/loader-store.js';
  import  LockingBytecodeDetail  from '$lib/LockingBytecodeDetails.svelte'
  import TransactionDetail  from '$lib/TransactionDetail.svelte'
	export let data:any;

</script>

{#if data.tx}
	<TransactionDetail bind:txid={data.tx}/>
{/if}
{#if data.lockingBytecode}
   <LockingBytecodeDetail bind:lockingBytecode={data.lockingBytecode}/>
{/if}
