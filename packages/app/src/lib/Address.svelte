<script>
	import { copy } from 'svelte-copy';
	import { toast } from '@zerodevx/svelte-toast';
	export let address;
</script>

<button 
use:copy={{ text: address , events: ['touchstart', 'mouseenter']}}
on:svelte-copy={() => toast.push('Address copied to clipboard')}>
	{address}
</button>
