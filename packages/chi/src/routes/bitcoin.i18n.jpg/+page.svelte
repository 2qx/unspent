<script>
	import { _, isLoading } from 'svelte-i18n';

  const borderless = [48,349,552,638] 
	const layouts = [
		[1],
		[1, 1],
		[1, 1, 1],
		[1, 2],
		[1, 1, 1, 1],
		[1, 1, 1, 1],
		[1, 1],
		[1, 1],
		[2, 1, 1],
		[1, 1],
		[3, 1],
		[1, 1, 2],
		[2, 1],
		[1, 1, 1],
		[1, 1],
		[1, 1],
		[1, 2, 1],
		[1, 1, 2],
		[2, 1],
		[1, 2],
		[1, 1, 1],
		[1, 2],
		[1, 1, 1],
		[1, 2],
		[1, 1, 1],
		[1, 1, 1],
		[1, 1, 1],
		[1],
		[1, 1, 1],
		[1, 1],
		[1, 1, 1],
		[1, 2],
		[1, 1],
		[1, 1, 1],
		[2, 1],
		[1, 1, 1],
		[2, 1],
		[1, 1, 1],
		[2, 1],
		[1, 2],
		[1, 1, 1],
		[1, 1],
		[1, 1, 1],
		[1, 1, 1],
		[1, 1, 1],
		[1],
		[1, 1],
		[1, 1, 1],
		[1, 1],
		[1, 1, 1],
		[2, 1],
		[1],
		[1, 1],
		[1, 1, 1],
		[2, 1],
		[1, 1, 1],
		[2, 1, 1],
		[1, 1, 1],
		[1, 2]
	];
</script>

<svelte:head>
	<title>The Bitcoin White Paper Webcomic</title>
	<meta name="description" content="The Bitcoin White Paper Webcomic" />
</svelte:head>
<section>
	{#if $isLoading}
		loading ...
	{:else}
		<div class="wrapper">
			{#each layouts as layout, i}
				{#each layout as l, j}
					<div
						style="grid-row: {i+1}; grid-column: span {(l / layout.reduce((a, c) => a + c, 0)) * 12};"
            class:border={!borderless.includes((i*12)+j)}
            class:borderless={borderless.includes((i*12)+j)}
					>
						<img
							src="/wp/_/{i.toString().padStart(2, '0')}_{j}_a.webp"
							loading={i < 3 ? 'eager' : 'lazy'}
						/>
					</div>
				{/each}
			{/each}
		</div>
	{/if}
</section>

<style>
	section {
	}
	.wrapper {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		row-gap: 5vw;
		column-gap: 2.6vw;
		grid-auto-rows: min-content;
	}
  .borderless > img{
    object-fit: contain;
  }
  .border{
    background: linear-gradient(#fff1ff, #ffffff);
    border: 0.2vmin solid rgb(0, 0, 0);
		border-radius: 20px;
    border-style: double;
  }
  .border > img{
    object-fit: cover;
  }
	.wrapper > div > img{
		border-radius: 20px;
		width: 100%;
    height: 100%;
    z-index: -10;
	}
	.c2 {
		max-width: 100%; 
	}
</style>
