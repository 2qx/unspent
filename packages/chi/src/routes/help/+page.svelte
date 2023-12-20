<script>
	import Carousel from 'svelte-carousel';
	import { browser } from '$app/environment';
	import touch from '$lib/images/touch.svg';
	import download from '$lib/images/download.svg';
	import wallet from '$lib/images/wallet.svg';

	let pagesCount = 23;
	let pages = Array.from(Array(pagesCount).keys()).map((n) => String(n + 1).padStart(2, '0'));

	let carousel; // for calling methods of the carousel instance

	const handleNextClick = () => {
		carousel.goToNext();
	};
</script>

<div id="book">
	<ul>
		<li style="background-color:white;">
			<a target="_blank" href="https://www.paytaca.com/#wallet">
				<img src={wallet} /><br />
				Paytaca
			</a>
		</li>
		<li style="background-color:white;">
			<a target="_blank" href="https://selene.cash/">
				<img src={wallet} /><br />
				Selene
			</a>
		</li>
		<li style="background-color:white;">
			<img src={download} /><br />
			<img src={touch} />
		</li>
	</ul>
</div>

{#if browser}
	<Carousel bind:this={carousel}>
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
		<!-- -->
	</Carousel>
{/if}

<button on:click={handleNextClick}>Next</button>

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
		font-size: larger;
	}
	ul li {
		padding: 20px;
	}
	ul {
		display: inline-flex;
		justify-content: center;
		list-style: none;
	}
</style>
