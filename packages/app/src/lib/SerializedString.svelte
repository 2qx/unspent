<script lang="ts">
	import { copy } from 'svelte-copy';
	import { toast } from '@zerodevx/svelte-toast';
	export let str: string;
</script>

<button use:copy={str} on:svelte-copy={() => toast.push('String copied to clipboard')}>
	{str}
</button>

<style>
	button {
		background: #e2e8f0;
		color: #50928c;
		border: unset;
		border-radius: 6px;
		padding: 0.75rem 1.5rem;
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		font-size: small;
		word-break: break-word;
		flex: 4;
	}
	button:hover {
		background: #cbd5e1;
		color: #475569;
	}
	button:focus {
		background: #94a3b8;
		color: #f1f5f9;
	}
</style>
