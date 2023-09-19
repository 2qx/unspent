<script context="module">
import '$lib/i18n' 
import { browser } from '$app/environment';
import { goto, invalidateAll }  from '$app/navigation';
import { SvelteToast } from '@zerodevx/svelte-toast';  
import Header from './Header.svelte';
import './styles.css';

import { locale, waitLocale , getLocaleFromNavigator, init} from 'svelte-i18n'

let currentPage;

if (browser) {
		// init on client side only
		// don't put this inside `load`, otherwise it will gets executed every time you changed route on client side
    console.log(getLocaleFromNavigator())
		init({
			fallbackLocale: "en",
			initialLocale: getLocaleFromNavigator(),
		});
}




</script>

<div class="app">
	<Header bind:currentPage={currentPage} />
<SvelteToast />
	<main>
		<slot p={currentPage} />
	</main>

	<footer>
		<p>visit <a href="https://unspent.app">unspent.app</a> to learn more</p>
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
		width: 100%;
		max-width: 64rem;
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
