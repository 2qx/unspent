<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { assets } from '$app/paths';
	export let data;
</script>

{#if data && data.isLocal}
	<div class="local">
		This is a local development instance, <a href="{base}/202212_fundraiser"> 🎉🍊</a>
	</div>
{:else if data && data.isDevelopment}
	<div class="dev">
		This is an <b>unstable</b> development version of the unspent app. Funds may be lost using new
		features. Please go to <a href="https://unspent.app">unspent.app</a> instead.
		<a href="{base}/202212_fundraiser">🎉🍊</a>
	</div>
{:else}
	<div class="alpha">
		This app is in active development! <br />
		Creation of new contracts is disabled pending a security upgrade. <br />
		Additional funds should NOT be sent to v0 or v1 contracts.<br/>
    Existing contracts may continue to be executed on schedule. Almost all funds on almost all contracts are safe. <br/>
    No new contracts. Outgoing payments only. This app does not store private keys anywhere.<br/>
	</div>
{/if}

<header>
	<div class="corner">
		<a href="{base}/">
			{#if data && (data.isLocal || data.isDevelopment)}
				<img src="{assets}/dev/favicon-32x32.png" alt="Dev Logo" />
			{:else}
				<img src="{assets}/images/favicon-32x32.png" alt="Logo" />
			{/if}
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<!--li class:active={$page.url.pathname.startsWith('/create')}>
				<a href="{base}/create">Create</a>
			</li-->
			<li class:active={$page.url.pathname === '/earn'}>
				<a href="{base}/earn">Earn</a>
			</li>
			<li class:active={$page.url.pathname === '/settings'}>
				<a href="{base}/settings">Settings</a>
			</li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner">
		<a href="https://github.com/2qx/unspent">
			<img src="{base}/images/github.svg" alt="GitHub" />
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.alpha {
		width: 100%;
		background-color: rgb(255, 0, 64);
		font-weight: 900;
		font-size: x-large;
		min-height: 150px;

		color: white;
		text-align: center;
	}

	.alpha a {
		color: darkgreen;
	}

	.dev {
		background-color: rgb(255, 225, 0);
		font-weight: 900;
		min-height: 50px;
		color: rgb(0, 0, 0);
		text-align: center;
	}

	.local {
		width: 100%;
		background-color: rgb(255, 0, 255);
		font-weight: 900;
		min-height: 50px;
		color: white;
		text-align: center;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
