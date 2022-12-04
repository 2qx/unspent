<script>
		import { assets } from '$app/paths';
	export let data;
</script>

{#if data && data.isDevelopment}
<div class="uc-image">
  <img src="{assets}/dev/under_construction.gif" alt="Whao!" />
</div>
{/if}

{#if data && data.isLocal}
<div class="uc-image">
  <img src="{assets}/dev/localhost.png" alt="local" />
</div>
{/if}

<style>
	

	.uc-image {
    position:fixed;
    top: 6em;
    z-index: 1;
    width:400px;
    align-items: center;
    pointer-events: none;
	}
  </style>