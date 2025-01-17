<script>
	import { assets } from '$app/paths';
  import { base } from '$app/paths';
	export let data;
</script>

<footer>
  <a href="{base}/faq">FAQ</a>
  <a href="{base}/stats">stats</a>
  <a href="{base}/202308_security">&lt;=v1 exploit</a>
</footer>

{#if data && data.isDevelopment}
	<div class="uc-image">
		<img src="{assets}/dev/under_construction.gif" alt="Whao!" />
	</div>
{/if}

{#if data && data.isLocal}
	<div class="uc-local">
		<img src="{assets}/dev/localhost.png" alt="local" />
	</div>
{/if}

<style>
	.uc-image {
		position: fixed;
		top: 5em;
		z-index: 1;
		width: 100%;
		pointer-events: none;
	}
	.uc-local {
		position: fixed;
		top: 5em;
		z-index: 1;
		width: 400px;
		pointer-events: none;
	}

  footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
