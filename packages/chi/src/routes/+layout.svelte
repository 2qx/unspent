<script context="module">
	import '$lib/i18n';
	import { browser } from '$app/environment';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import Header from './Header.svelte';
	import CopyToClipboard from '$lib/CopyToClipboard.svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import './styles.css';
	import { register } from 'svelte-i18n';

	import { getLocaleFromNavigator, init } from 'svelte-i18n';
	register('en', () => import('$lib/locale/en.json'));

	let currentPage;

	if (browser) {
		// init on client side only
		// don't put this inside `load`, otherwise it will gets executed every time you changed route on client side
		let locale = getLocaleFromNavigator();

		init({
			fallbackLocale: 'en',
			initialLocale: locale
		});
	}
</script>

<div class="app">
	<Header bind:currentPage />
	<SvelteToast />
	<main>
		<slot p={currentPage} />
	</main>
	<footer>
		<div class="donate">
			<a href="/moonshot"><button>Your skills are needed for a job.</button></a>
		</div>
		<p>
			₿∙ϕ:
			<a target="_blank" href="https://unspent.app/documentation">docs</a>
			<a target="_blank" href="https://unspent.app/earn">earn</a>
			<a href="/stats">stats</a> |
			<a target="_blank" href="https://t.me/unspent_cash">telegram</a>
		</p>
		<div class="footSpacer" />
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 3px;
		align-self: center;
		width: 100%;
		max-width: 44rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.donate button {
		border-radius: 10px;
		color: #333a31;
		font-weight: 800;
		background-color: rgb(201, 201, 201);
		font-size: small;
	}

	.footSpacer {
		height: 300px;
	}
	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
