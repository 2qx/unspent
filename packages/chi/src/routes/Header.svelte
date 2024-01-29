<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	import logo from '$lib/images/logo.svg';
	import home from '$lib/images/home.svg';
	import chart from '$lib/images/chart.svg';
	import code from '$lib/images/code.svg';
	import help from '$lib/images/help.svg';
	import restart from '$lib/images/restart.svg';
	import table from '$lib/images/table.svg';
	import github from '$lib/images/github.svg';
	import { receiptAddressStore, stateStore, pageStore } from '$lib/store.js';

	let addressIsSet = false;
	let stateValue;
	receiptAddressStore.subscribe((value) => {
		addressIsSet = value ? true : false;
	});

	stateStore.subscribe((value) => {
		stateValue = Number(value);
		console.log(stateValue);
	});

	const resetState = () => {
		stateStore.set('');
		receiptAddressStore.set('');
		pageStore.set('');
		reloadPage();
	};

  function reloadPage() {
		const thisPage = window.location.pathname;

		goto('/').then(() => goto(thisPage));
	}
</script>

<header>
	<div class="corner">
		<a href="/">
			<img src={logo} alt="Unspent Cash" />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li  aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="{base}/">
					<img src={home} alt="home" />
				</a>
			</li>
			<!--li  aria-current={$page.url.pathname === '/history' ? 'page' : undefined}>
        <a href="{base}/history">
        <img src={history} alt="history" />
        </a>
			</li-->
			{#if stateValue > 3}
				{#if stateValue > 5}
					<li aria-current={$page.url.pathname === '/table' ? 'page' : undefined}>
						<a href="{base}/table">
							<img src={table} alt="table" />
						</a>
					</li>
				{/if}
				<li class="{(stateValue == 4) ? 'flashing' : ''}" aria-current={$page.url.pathname === '/chart' ? 'page' : undefined}>
					<a href="{base}/chart">
						<img src={chart} alt="chart" />
					</a>
				</li>
				{#if stateValue > 5}
					<li aria-current={$page.url.pathname === '/code' ? 'page' : undefined}>
						<a href="{base}/code">
							<img src={code} alt="code" />
						</a>
					</li>
				{/if}
			{/if}
			<li aria-current={$page.url.pathname === '/help' ? 'page' : undefined}>
				<a href="{base}/help">
					<img src={help} alt="help" />
				</a>
			</li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner" >
    <div>
      <span on:click={resetState}>
        <img src={restart} alt="restart" />
      </span>
      <a href="https://github.com/2qx/unspent">
        <img src={github} alt="GitHub" />
      </a>
    </div>

		
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 6em;
		height: 3em;
	}

	.corner a {
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

	li[aria-current='page']::before {
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


	.flashing {
		animation: blinker 3s linear infinite;
	}

	@keyframes blinker {
		50% {
			opacity: 0.2;
		}
	}
</style>
