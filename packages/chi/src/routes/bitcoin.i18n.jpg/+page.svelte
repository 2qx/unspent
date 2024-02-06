<script>
	import { _, isLoading } from 'svelte-i18n';

	const borderless = [48, 349, 552, 638];
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
	const text = [
		[
			[
				{ x: 0, y: 40 },
				{ x: 50, y: 80 }
			]
		],
		[
			[
				{ x: 0, y: 0 },
				{ x: 45 , y: 20 },
				{ x: 50, y: 87 }
			],
      [
				{ x: 0, y: 5 },
				{ x: 80, y: 5 }
			]
		],
    [
			[
				{ x: 0, y: 0 }
			],
      [
				{ x: 0, y: 0 },
				{ x: 30, y: 20 }
			],
      [
				{ x: 0, y: 0 },
				{ x: 5, y: 15 }
			]
		],
    [
			[
				{ x: 45, y: 10 },
				{ x: 50 , y: 25 }
			],
      [
				{ x: 0, y: 0 },
				{ x: 65, y: 25 }
			]
		],
    [
      [	{ x: 10, y: 5 }	],
      [	{ x: 25, y: 0 }	],
      [	{ x: 25, y: 0 }	],
      [	{ x: 25, y: 0 }	]
		],
    [
      [	{ x: 25, y: 0 }	],
      [	{ x: 25, y: 0 }	],
      [	{ x: 25, y: 0 }	],
      [	{ x: 25, y: 0 }	]
		],
    [
			[
				{ x: 10, y: 15 },
				{ x: 25 , y: 20 }
			],
      [
				{ x: 0, y: 5 },
				{ x: 45, y: 5 }
			]
		]

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
						style="grid-row: {i + 1}; grid-column: span {(l / layout.reduce((a, c) => a + c, 0)) *
							12}; display:inline-table; position:relative"
						class:border={!borderless.includes(i * 12 + j)}
						class:borderless={borderless.includes(i * 12 + j)}
					>
						<img
							src="/wp/_/{i.toString().padStart(2, '0')}_{j}_a.webp"
							loading={i < 3 ? 'eager' : 'lazy'}
						/>

						{#if text[i]}
							{#if text[i][j]}
								{#each text[i][j] as c, k}
									<div
										class="comic"
										style="position:absolute; left: {c.x}%; top: {c.y}%; z-index:10;"
									>
										<div class="left" />
										<div class="right" />
										<p>
											{@html $_(`wp_${i.toString().padStart(2, '0')}_${j}_${k}`)}
										</p>
									</div>
								{/each}
							{/if}
						{/if}
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
  .comic  {
		padding: 1%;
	}
	.comic > p {
		text-transform: uppercase;
    font-size: min(2vi,0.85em);
    margin: 0px;
	}
  .comic  > h3 {
    font-size: min(2.5vi,1.35em);
    font-weight: 800;
    margin: 10px;
	}
	.borderless > img {
		object-fit: contain;
	}
	.border {
		background: linear-gradient(#f0ebe2, #ffffff);
		border: 0.2vmin solid rgb(0, 0, 0);
		border-radius: 2px;
		border-style: double;
	}
	.border > img {
    width:100%;
    height: 100%;
		object-fit: cover;
	}
	.wrapper > div > img {
		border-radius: 2px;
		width: 100%;
		z-index: -10;
	}
	.c2 {
		max-width: 100%;
	}
</style>
