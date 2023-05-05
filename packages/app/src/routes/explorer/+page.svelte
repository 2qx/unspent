<script lang="ts">
	import Paper, { Title, Content } from '@smui/paper';
	import { deriveLockingBytecodeHex } from '@unspent/phi';
	import LockingBytecodeDetail from '$lib/LockingBytecodeDetails.svelte';
	import TransactionDetail from '$lib/TransactionDetail.svelte';
	export let data: any;
	if (data.cashaddr) {
		data.lockingBytecode = deriveLockingBytecodeHex(data.cashaddr);
	}
</script>

<svelte:head>
	<title>Explorer</title>
	<meta name="description" content="View Blockchain Data" />
</svelte:head>
<section>
	<Paper class="box">
		<Title style="display: flex; justify-content: space-between; ">
			<span>
				{#if data.tx}
					Transaction
				{/if}
				{#if data.lockingBytecode}
					Locking Bytecode
				{/if}
			</span>
		</Title>
		<Content>
			{#if data.tx}
				<pre>{data.tx}</pre>
				<TransactionDetail bind:txid={data.tx} />
			{/if}
			{#if data.lockingBytecode}
				<pre>{data.lockingBytecode}</pre>
				<LockingBytecodeDetail bind:lockingBytecode={data.lockingBytecode} bind:network={data.network} />
			{/if}
		</Content>
	</Paper>
</section>
