<script>
	import { confetti } from '@neoconfetti/svelte';
	import ContractPicker from '$lib/ContractPicker.svelte';

	let isPublished = false;

	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Create</title>
	<meta name="description" content="Create unspent contracts" />
</svelte:head>

<section>
<br>
<ContractPicker />

</section>

{#if isPublished}
	<div
		style="position: absolute; left: 50%; top: 50%"
		use:confetti={{
			force: 0.2,
			stageWidth: window.innerWidth,
			stageHeight: window.innerHeight,
			colors: ['#F0F', '#000000', '#f0f']
		}}
	/>
{/if}

<style>
	/* form {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex: 1;
	} */

	/*
	.grid {
		--width: min(100vw, 40vh, 380px);
		max-width: var(--width);
		align-self: center;
		justify-self: center;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: start;
	}

	.grid .row {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-gap: 0.2rem;
		margin: 0 0 0.2rem 0;
	}

	.grid.bad-guess .row.current {
		animation: wiggle 0.5s;
	}

	.grid.playing .row.current {
		filter: drop-shadow(3px 3px 10px var(--color-bg-0));
	} */

	/* input {
		aspect-ratio: 1;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		box-sizing: border-box;
		text-transform: lowercase;
		border: none;
		font-size: calc(0.08 * var(--width));
		border-radius: 2px;
		background: white;
		margin: 0;
		color: rgba(0, 0, 0, 0.7);
	}
 */
</style>
