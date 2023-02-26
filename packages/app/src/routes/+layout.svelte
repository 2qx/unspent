<script lang="ts">
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import './styles.css';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { assets } from '$app/paths';

	let lightTheme = true;

	export let data: any;
	// Optionally set default options here
	// const options = {
	// ...
	// }
</script>

<div class="app">
	{#if lightTheme === true}
		<!-- SMUI Styles -->
		<link rel="stylesheet" href="{assets}/smui.css" />

		<!-- Site Styles -->
		<link rel="stylesheet" href="{assets}/site.css" />
	{:else if lightTheme === false}
		<!-- SMUI Styles -->
		<link rel="stylesheet" href="{assets}/smui.css" />
		<link rel="stylesheet" href="{assets}/smui-dark.css" media="screen" />

		<!-- Site Styles -->
		<link rel="stylesheet" href="{assets}/site.css" />
		<link rel="stylesheet" href="{assets}/site-dark.css" media="screen" />
	{:else}
		<!-- SMUI Styles -->
		<link rel="stylesheet" href="{assets}/smui.css" media="(prefers-color-scheme: light)" />
		<link
			rel="stylesheet"
			href="{assets}/smui-dark.css"
			media="screen and (prefers-color-scheme: dark)"
		/>

		<!-- Site Styles -->
		<link rel="stylesheet" href="{assets}/site.css" media="(prefers-color-scheme: light)" />
		<link
			rel="stylesheet"
			href="{assets}/site-dark.css"
			media="screen and (prefers-color-scheme: dark)"
		/>
	{/if}
	<Header bind:data />
	<SvelteToast />
	{#if data && data.splash}
		<img id="banner" src="{assets}/images/banner.svg" alt="Unspent" />
		<div id="description">
			<b
				>Decentralized finance using unspent transaction unlocking script. Open source, on-chain,
				running nativiely & directly on Bitcoin Cash (BCH).</b
			>
		</div>
	{/if}

	<main>
		<slot />
	</main>

	<Footer bind:data />
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	#banner {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 5px;
		width: 100%;
		max-width: 44rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	#description {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 5px;
		width: 100%;
		max-width: 44rem;
		margin: 0 auto;
		box-sizing: border-box;
		text-align: center;
		background-color: #fff;
		border: 3px solid #f0f;
	}
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 44rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}

	main {
		background-color: rgba(244, 244, 244, 0.2);
	}
</style>
