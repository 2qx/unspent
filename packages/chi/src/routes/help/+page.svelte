<script>
	import Carousel from 'svelte-carousel';
	import { browser } from '$app/environment';
	import wallet from '$lib/images/wallet.svg';

	let pagesCount = 23;
	let pages = Array.from(Array(pagesCount).keys()).map((n) => String(n + 1).padStart(2, '0'));

	let carousel; // for calling methods of the carousel instance

	const handleNextClick = () => {
		carousel.goToNext();
	};
</script>

{#if browser}
	<Carousel autoplay={true} autoplayDuration="6000" bind:this={carousel}>
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
<ul>
	<li>
		<a href="https://www.paytaca.com/#wallet">
			<img src={wallet} />
			Paytaca
		</a>
	</li>
	<li>
		<a href="https://selene.cash/">
			<img src={wallet} />
			Selene
		</a>
	</li>
</ul>

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
		padding: 30px;
	}
	ul {
		display: inline-flex;
		justify-content: center;
		list-style: none;
	}
</style>
