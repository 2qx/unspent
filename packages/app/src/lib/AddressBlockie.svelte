<script>
	import makeBlockie from 'ethereum-blockies-base64';
	export let lockingBytecode;
	export let size;
</script>

<div>
	{#if lockingBytecode && size}
		<img
			style="width:{size}px; height:{size}px;"
			alt={lockingBytecode}
			src={makeBlockie(lockingBytecode)}
		/>
	{:else if lockingBytecode}
		<img
			style="width:100px; height:100px;"
			alt={lockingBytecode}
			src={makeBlockie(lockingBytecode)}
		/>
	{/if}
</div>

<style>
	div {
		float: right;
		padding: 10px;
		z-index: 1;
	}

	div :global(canvas) {
		/* fit QR to wrapper */

		left: 0;
		top: 0;
	}
</style>
