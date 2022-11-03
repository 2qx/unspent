<script>
	import { copy } from 'svelte-copy';
	import { toast } from '@zerodevx/svelte-toast';
	export let address;
</script>

<button use:copy={address} on:svelte-copy={() => toast.push('Address copied to clipboard')}>
	{address}
</button>
