<script>
	import Carousel from 'svelte-carousel';
	import CustomDot from '$lib/CustomDot.svelte';
	import { browser } from '$app/environment';
	import { _, isLoading } from 'svelte-i18n';
	import paytaca from '$lib/images/paytaca.svg';
	import selene from '$lib/images/selene.svg';
	import arrow_right from '$lib/images/arrow_right.svg';
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
		}
	});

	const handleWpClick = () => {
		if (stateValue < 1) {
			stateStore.set('1');
		}
		window.location = $_('whitepaper');
	};

	function handleWalletClick(walletIdx) {
		if (stateValue < 2) {
			stateStore.set('2');
		}
		if (walletIdx == 'selene') {
			window.location = 'https://selene.cash/';
		}
		if (walletIdx == 'paytaca') {
			window.location = 'https://www.paytaca.com/#wallet';
		}
	}

	const handleNextClick = () => {
		carousel.goToNext();
		if (currentPageIndex < pagesCount) {
			pageStore.set(currentPageIndex + 1);
		}
	};
	const showPage = (p) => {
		pageStore.set(p);
		carousel.goTo(p);
	};
</script>

<div id="book">
	<ul>
		<li style="background-color:white;">
			{#if $isLoading}
				<div on:click={handleWpClick}>
					<img src={whitepaper} /><br />
				</div>
			{:else}
				<div on:click={handleWpClick}>
					<img src={whitepaper} /><br />
					BCH
				</div>
			{/if}
		</li>

		{#if (stateValue == 1 && currentPageIndex > 2) || stateValue > 1}
			<li on:click={() => handleWalletClick('paytaca')} style="background-color:white;">
				<img src={paytaca} /><br />
				Paytaca
			</li>
			<li on:click={() => handleWalletClick('selene')} style="background-color:white;">
				<img src={selene} /><br />
				Selene
			</li>
		{/if}
	</ul>
</div>

<!-- autoplay autoplayDuration={4400} -->

{#if browser}
	<Carousel
		initialPageIndex={currentPageIndex}
		infinite={false}
		bind:this={carousel}
		on:pageChange={(event) => (currentPageIndex = event.detail)}
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
			<!-- -->
		</div>
		<div slot="dots" class="custom-dots">
			{#each Array(pagesCount) as _, pageIndex (pageIndex)}
				<CustomDot
					symbol={pageIndex + 1}
					active={currentPageIndex === pageIndex}
					on:click={() => showPage(pageIndex)}
				/>
			{/each}
		</div>
		<!-- -->
	</Carousel>
{/if}
<div class="button-box">
	<button class="next-button" on:click={handleNextClick}>
		<img src={arrow_right} />
	</button>
</div>

<div class="girl-boss"><img src={boss} />{stateValue + 1}</div>

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
		padding: 15px;
	}

	ul {
		border-radius: 10px;
		display: inline-flex;
		justify-content: center;
		list-style: none;
	}

	/* custom dots */
	.custom-dots {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		padding: 0 20px;
	}

	.button-box {
		align-self: center;
	}
	.next-button {
		padding: 0 30px;
		width: max-content;
		border-color: black;
		border-radius: 40px;
		border-width: 5px;
		background-color: rgrgb(214, 214, 214);
		background-image: linear-gradient(
			to top left,
			rgba(0, 0, 0, 0.2),
			rgba(0, 0, 0, 0.2) 30%,
			rgba(0, 0, 0, 0)
		);
		box-shadow: inset 2px 2px 3px rgba(255, 255, 255, 0.6), inset -2px -2px 3px rgba(0, 0, 0, 0.6);
	}

	.girl-boss {
		align-self: left;
		font-weight: 700;
		font-size: larger;
	}
</style>
