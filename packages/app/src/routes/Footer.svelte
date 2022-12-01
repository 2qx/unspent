<script>
		import { assets } from '$app/paths';
	export let data;
</script>

{#if data && data.isDevelopment}
<div class="uc-image">
  <img src="{assets}/dev/under_construction.gif" alt="Whao!" />
</div>

{/if}

<style>
	

	.uc-image {
    position:fixed;
    top: 10em;
    z-index: 1;
    width:100%;
	}
  </style>