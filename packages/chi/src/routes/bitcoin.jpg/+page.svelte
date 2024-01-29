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
			src="/wp/{$_('wp_dir')}/00-title.jpg"
			class="img-fluid"
      loading="eager"
			alt="White Paper comic"
		/>
		<img src="/wp/{$_('wp_dir')}/01-05.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/06-10.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/11-15.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/16-20.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/21-25.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/26-30.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/31-35.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/36-40.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/41-45.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/46-50.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/51-55.jpg" loading="lazy" class="img-fluid" />
		<img src="/wp/{$_('wp_dir')}/56-58.jpg" loading="lazy" class="img-fluid" />

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
	.img-fluid {
		max-width: 100%;
	}
</style>
