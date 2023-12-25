<script>
	import Carousel from 'svelte-carousel';
	import CustomDot from '$lib/CustomDot.svelte';
	import { browser } from '$app/environment';
	import touch from '$lib/images/touch.svg';
	import { _, isLoading } from 'svelte-i18n';
	import download from '$lib/images/download.svg';
	import paytaca from '$lib/images/paytaca.svg';
	import selene from '$lib/images/selene.svg';
	import arrow_right from '$lib/images/arrow_right.svg';
	import whitepaper from '$lib/images/whitepaper.svg';

	/**
	 * Current page indicator dots
	 */
	export let dots = true;
	let currentPageIndex = 0;

	let pagesCount = 24;
	let pages = Array.from(Array(pagesCount).keys()).map((n) => String(n + 1).padStart(2, '0'));
	let locale;
	let carousel; // for calling methods of the carousel instance
	const handleNextClick = () => {
		carousel.goToNext();
		currentPageIndex = carousel.get;
	};
	const showPage = (p) => {
		carousel.goTo(p);
	};
</script>
<div id="book">
	<ul>
		<li style="background-color:white;">
			{#if $isLoading}
				<a target="_blank" href="">
					<img src={whitepaper} /><br />
				</a>
        
			{:else}
				<a target="_blank" href={$_('whitepaper')}>
					<img src={whitepaper} /><br />
          BCH
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


<!-- autoplay autoplayDuration={4400} -->

{#if browser}
	<Carousel 
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

<button style="padding:20px;" on:click={handleNextClick}>
  <img src={arrow_right} />
</button>

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

	/* custom dots */
	.custom-dots {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		padding: 0 20px;
	}
</style>
