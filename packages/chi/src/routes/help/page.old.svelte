<script>
	import { goto } from '$app/navigation';
	import Carousel from 'svelte-carousel';
	import CustomDot from '$lib/CustomDot.svelte';
	import { browser } from '$app/environment';
	import { _, isLoading } from 'svelte-i18n';
	import paytaca from '$lib/images/paytaca.svg';
	import selene from '$lib/images/selene.svg';
	import arrow_right_white from '$lib/images/arrow_right_white.svg';
	import arrow_step from '$lib/images/arrow_step.svg';
	import boss from '$lib/images/boss.svg';
	import whitepaper from '$lib/images/whitepaper.svg';
	import { stateStore, pageStore } from '$lib/store.js';

	// 0  2 overview
	// 1  4 whitepaperClicked
	// 2  9 walletClicked
	// 3 10 hasReceiptAddress
	// 4 11 isBroadcasted
	// 5 12 viewedChart
	// 6 13 copiedAddr or Link
	// 7 23 hasBalance
	// 8 26 girlBoss

	const DOC_MAP = [2, 4, 9, 10, 11, 12, 13, 23, 26];

	let stateValue;

	/**
	 * Current page indicator dots
	 */
	export let dots = true;
	let currentPageIndex;
	let carousel; // for calling methods of the carousel instance

	let pagesCount = 23;
	let pages = Array.from(Array(pagesCount).keys()).map((n) => String(n + 1).padStart(2, '0'));

	const skipState = () => {
		if (stateValue < 7) stateValue += 1;
		stateStore.set(String(stateValue));
		reloadPage();
	};

	function reloadPage() {
		const thisPage = window.location.pathname;

		goto('/').then(() => goto(thisPage));
	}

	stateStore.subscribe((value) => {
		if (value) {
			pagesCount = DOC_MAP[Number(value)];
		} else {
			pagesCount = DOC_MAP[0];
		}
		stateValue = Number(value);
		pages = Array.from(Array(pagesCount).keys()).map((n) => String(n + 1).padStart(2, '0'));
	});

	pageStore.subscribe((value) => {
		if (value) {
			currentPageIndex = Number(value);
		} else {
			currentPageIndex = 0;
			pageStore.set('0');
		}
	});

	const handleWpClick = () => {
		if (stateValue < 1) {
			stateStore.set('1');
		}
		reloadPage();
		//window.location = $_('bitcoin.jpg');
		//goto('/bitcoin.jpg');
	};

	function handleWalletClick(walletIdx) {
		if (stateValue < 2) {
			stateStore.set('2');
		}
		reloadPage();
		// this could be saved for later
		walletIdx;
	}

	const updatePage = (p) => {
		currentPageIndex = p;
		pageStore.set(p);
	};

	const handleNextClick = () => {
		if (currentPageIndex < pagesCount - 1) {
			carousel.goToNext();
		} else if (currentPageIndex == pagesCount - 1) {
			console.log(currentPageIndex);
			switch (currentPageIndex) {
				case 1:
					handleWpClick();
					window.open($_('bitcoin.jpg'), '_blank');
					break;
				case 3:
					handleWalletClick('selene');
					window.open(`https://selene.cash/`, '_blank');
					break;
				case 8:
					goto('/');
					break;
				case 9:
					goto('/');
					break;
				case 10:
					goto('/chart');
					break;
				case 11:
					goto('/');
					break;
				case 12:
					goto('/');
					break;
				default:
					break;
			}
		}
	};

	const showPage = (p) => {
		currentPageIndex = p;
		pageStore.set(p);
		carousel.goTo(p);
	};
</script>

<svelte:head>
	<title>Unspent Cash</title>
	<meta name="description" content="Unspent Cash" />
</svelte:head>
<section>
	<div id="book">
		<ul>
			<li>
				{#if $isLoading}
					<div on:click={handleWpClick}>
						<img src={whitepaper} /><br />
					</div>
				{:else}
					<a
						class={currentPageIndex == 1 ? 'flashing' : ''}
						on:click={handleWpClick}
						target="_blank"
						href={$_('bitcoin.jpg')}
					>
						<img src={whitepaper} /><br />
						BCH
					</a>
				{/if}
			</li>

			{#if (stateValue == 1 && currentPageIndex > 2) || stateValue > 1}
				<li style="background-color:white;">
					<a
						href="https://www.paytaca.com/#wallet"
						target="_blank"
						class={currentPageIndex == 3 ? 'flashing' : ''}
						on:click={() => handleWalletClick('paytaca')}
					>
						<img src={paytaca} /><br />
						Paytaca
					</a>
				</li>
				<li style="background-color:white;">
					<a
						class={currentPageIndex == 3 ? 'flashing' : ''}
						href="https://selene.cash/"
						target="_blank"
						on:click={() => handleWalletClick('selene')}
					>
						<img src={selene} /><br />
						Selene
					</a>
				</li>
			{/if}
		</ul>
	</div>

	{#if browser}
		{#if !$isLoading}
			<div class="caption" dir={$_('direction')}>
				{$_(String(currentPageIndex))}
			</div>
		{/if}
		<Carousel
			initialPageIndex={currentPageIndex}
			infinite={false}
			timingFunction={'linear'}
			bind:this={carousel}
			on:pageChange={(event) => updatePage(event.detail)}
		>
			{#each pages as page}
				<div id="book">
					<img width="100%" src="/h/{String(page).padStart(2, '0')}.svg" alt="home" />
				</div>
			{/each}

			<div slot="prev">
				<!-- -->
			</div>
			<div slot="next">
				<div class="button-box {currentPageIndex == 0 ? 'flashing' : ''}">
					<button
						class="next-button"
						class:next-button_faded={currentPageIndex == pagesCount - 1}
						on:click={handleNextClick}
					>
						<img src={arrow_right_white} />
					</button>
				</div>
			</div>

			<!-- autoplay autoplayDuration={4400} -->
			<div slot="dots" class="custom-dots">
				{#each Array(pagesCount) as _, pageIndex (pageIndex)}
					<CustomDot
						symbol={pageIndex + 1}
						active={currentPageIndex === pageIndex}
						on:click={() => showPage(pageIndex)}
					/>
				{/each}

				{#if stateValue < 8}
					{#each Array(3) as _, pageIndex (pageIndex)}
						<CustomDot symbol={pagesCount + pageIndex + 1} disabled={true} />
					{/each}
				{/if}
			</div>
		</Carousel>
	{/if}

	<div class="girl-boss"><img src={boss} />{stateValue + 1}</div>
	<span style="align:right; width: 10px;" on:click={skipState}>
		<img src={arrow_step} />
	</span>
</section>

<style>
	#book {
		align-items: center;
		justify-content: center;
		display: flex;
	}

	a {
		text-decoration: none;
		color: black;
		font-weight: 700;
	}
	ul li {
		padding: 0px 20px;
		font-weight: 700;
		align-self: center;
	}

	ul li img {
		min-height: 30px;
	}

	ul {
		background-color: white;
		border-radius: 50px;
		padding: 10px;
		margin: 0px;
		border-radius: 40px;
		display: inline-flex;
		justify-content: center;
		list-style: none;
	}

	/* custom dots */
	.custom-dots {
		background-color: white;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.button-box {
		align-self: center;
		width: 100%;
		z-index: 100;
	}

	.caption {
		height: 8ex;
		padding: 1ex;
		text-align: center;
		font-size: large;
		font-weight: 700;
		background-color: white;
	}

	.next-button {
		padding: 15px;
		width: max-content;
		border-color: black;
		border-radius: 60px;
		border-width: 2px;
		background-color: #8dc351;
		background-image: linear-gradient(
			to top left,
			rgba(129, 129, 129, 0.2),
			rgba(158, 158, 158, 0.2) 30%,
			rgba(151, 151, 151, 0)
		);
		box-shadow: inset 2px 2px 3px rgba(255, 255, 255, 0.6), inset -2px -2px 3px rgba(0, 0, 0, 0.6);
		position: absolute;
		transform: translate(-110%, -50%);
		top: 1ex;
	}

	.next-button_faded {
		background-color: rgb(245, 245, 245);
		color: linen;
		opacity: 1;
	}

	.girl-boss {
		align-self: left;
		font-weight: 700;
		font-size: larger;
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