<script>
	import Carousel from 'svelte-carousel';
	import { browser } from '$app/environment';
	import touch from '$lib/images/touch.svg';
	import { _, isLoading } from 'svelte-i18n';
	import download from '$lib/images/download.svg';
	import paytaca from '$lib/images/paytaca.svg';
	import selene from '$lib/images/selene.svg';
	import whitepaper from '$lib/images/whitepaper.svg';

	let pagesCount = 23;
	let pages = Array.from(Array(pagesCount).keys()).map((n) => String(n + 1).padStart(2, '0'));
	let locale;
	let carousel; // for calling methods of the carousel instance
	const handleNextClick = () => {
		carousel.goToNext();
	};
</script>

<div id="book">
	<ul>
		<li style="background-color:white;">
			{#if $isLoading}
				<a target="_blank" href="">
					<img src={whitepaper} /><br />
					<img src={touch} />
				</a>
			{:else}
				<a target="_blank" href={$_('whitepaper')}>
					<img src={whitepaper} /><br />
					<img src={touch} />
				</a>
			{/if}
		</li>
		<li style="background-color:white;">
			<a target="_blank" href="https://www.paytaca.com/#wallet">
				<img src={paytaca} /><br />
				Paytaca
			</a>
		</li>
		<li style="background-color:white;">
			<a target="_blank" href="https://selene.cash/">
				<img src={selene} /><br />
				Selene
			</a>
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
