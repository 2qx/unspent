<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let address: string;
	export let index: number;
	function rmAddress() {
		dispatch('message', {
			addressIdx: index
		});
	}
</script>

<input type="text" bind:value={address} size="48" required placeholder="bitcoincash:q1a2s3d4f..." />
{#if index > 1}
	<button on:click={rmAddress}>⊗</button>
{/if}

<style>
	button {
		padding: 2px;
	}
</style>
