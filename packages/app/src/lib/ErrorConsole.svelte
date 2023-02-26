<script lang="ts">
	export let errorText: string;
</script>

<div class="error">
	{errorText}
</div>

<style>
	.error {
		white-space: pre-wrap;
		overflow: scroll;
		font-family: 'Courier New', Courier, monospace;
		background-color: #f4e6e6;
		font-size: small;
		padding: 10px;
	}
</style>
