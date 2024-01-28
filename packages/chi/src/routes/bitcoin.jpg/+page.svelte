<script>
	import { _, isLoading } from 'svelte-i18n';

  
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
		src="/wp/{$_('locale')}/00-title.jpg"
		class="img-fluid"
		alt="White Paper comic first tile"
	/>
	<img src="/wp/{$_('locale')}/01-05.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/06-10.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/11-15.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/16-20.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/21-25.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/26-30.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/31-35.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/36-40.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/41-45.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/46-50.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/51-55.jpg" class="img-fluid" />
	<img src="/wp/{$_('locale')}/56-58.jpg" class="img-fluid" />
  {/if}
  <a href="{$_('bitcoin.pdf')}">original whitepaper</a>
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
