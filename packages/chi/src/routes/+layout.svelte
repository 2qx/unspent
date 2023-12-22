<script context="module">
	import '$lib/i18n';
	import { browser } from '$app/environment';
	import { goto, invalidateAll } from '$app/navigation';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import Header from './Header.svelte';
	import './styles.css';

	import { locale, waitLocale, getLocaleFromNavigator, init } from 'svelte-i18n';

	let currentPage;

	if (browser) {
		// init on client side only
		// don't put this inside `load`, otherwise it will gets executed every time you changed route on client side
		let locale = getLocaleFromNavigator();
		if (locale.includes('-')) {
			locale = locale.split('-').shift();
		}

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
		<p>visit <a href="https://unspent.app/documentation">unspent.app</a> to learn more</p>
		<p> <a href="https://unspent.cash/s?q=eJwrWymyJ1Nv2YHoo8r%2FFrOdZj3kkVok9vluxxoAnkYMog%3D%3D">💚 support this app 💚</a></p>
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
		padding: 1rem;
    align-self: center;
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

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
