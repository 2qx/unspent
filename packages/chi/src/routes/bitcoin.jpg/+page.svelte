<script>
	import { _, isLoading } from 'svelte-i18n';
	import CopyToClipboard from '$lib/CopyToClipboard.svelte';
	import { toast } from '@zerodevx/svelte-toast';
</script>

<svelte:head>
	<title>The Bitcoin White Paper Webcomic</title>
	<meta name="description" content="The Bitcoin White Paper Webcomic" />
</svelte:head>
<section>
	{#if $isLoading}
		...
	{:else}
		<img
			class="c2"
      srcset="/wp_sm/{$_('wp_dir')}/00-title.jpg 530w, /wp/{$_('wp_dir')}/00-title.jpg 1060w"
      sizes="(max-width: 530px) 530px, 1060px"

			src="/wp/{$_('wp_dir')}/00-title.jpg"
			loading="eager"
			alt="The bitcoin whitepaper webcomic"
		/>

		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/01-05.jpg 530w, /wp/{$_('wp_dir')}/01-05.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/01-05.jpg"                     loading="eager" />
		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/06-10.jpg 530w, /wp/{$_('wp_dir')}/06-10.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/06-10.jpg" fetchpriority="low" loading="lazy"  />
		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/11-15.jpg 530w, /wp/{$_('wp_dir')}/11-15.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/11-15.jpg" fetchpriority="low" loading="lazy"  />
		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/16-20.jpg 530w, /wp/{$_('wp_dir')}/16-20.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/16-20.jpg" fetchpriority="low" loading="lazy"  />
		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/21-25.jpg 530w, /wp/{$_('wp_dir')}/21-25.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/21-25.jpg" fetchpriority="low" loading="lazy"  />
		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/26-30.jpg 530w, /wp/{$_('wp_dir')}/26-30.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/26-30.jpg" fetchpriority="low" loading="lazy"  />
		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/31-35.jpg 530w, /wp/{$_('wp_dir')}/31-35.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/31-35.jpg" fetchpriority="low" loading="lazy"  />
		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/36-40.jpg 530w, /wp/{$_('wp_dir')}/36-40.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/36-40.jpg" fetchpriority="low" loading="lazy"  />
		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/41-45.jpg 530w, /wp/{$_('wp_dir')}/41-45.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/41-45.jpg" fetchpriority="low" loading="lazy"  />
		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/46-50.jpg 530w, /wp/{$_('wp_dir')}/46-50.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/46-50.jpg" fetchpriority="low" loading="lazy"  />
		<img class="c"  srcset="/wp_sm/{$_('wp_dir')}/51-55.jpg 530w, /wp/{$_('wp_dir')}/51-55.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/51-55.jpg" fetchpriority="low" loading="lazy"  />
		<img class="c2" srcset="/wp_sm/{$_('wp_dir')}/56-58.jpg 530w, /wp/{$_('wp_dir')}/56-58.jpg 1060w"  sizes="(max-width: 600px) 530px, 1060px" src="/wp/{$_('wp_dir')}/56-58.jpg" fetchpriority="low" loading="lazy"  />

		<CopyToClipboard
			on:copy={() => toast.push('bitcoincash:pzycl4x2sc8z8rep6ex9x843qwucd7h3uvy0hrlmjc 📋💚🗸 ')}
			text="bitcoincash:pzycl4x2sc8z8rep6ex9x843qwucd7h3uvy0hrlmjc"
			let:copy
		>
			<div class="donate">
				<button on:click={copy}> Donate to Scott McCloud </button>
			</div>
		</CopyToClipboard>
		<p>donations: bitcoincash:pzycl4x2sc8z8rep6ex9x843qwucd7h3uvy0hrlmjc</p>
		<div style="height:10ex;" />
		<a href={$_('bitcoin.pdf')}>original whitepaper</a>
		<div style="height:10ex;" />
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
		line-break: anywhere;
	}
	.c {
		max-width: 100%;
		aspect-ratio: 1060/2879;
	}
	.c2 {
		max-width: 100%;
	}
</style>
