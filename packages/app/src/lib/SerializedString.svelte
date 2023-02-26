<script>
	import Button, { Label, Icon } from '@smui/button';
	import { copy } from 'svelte-copy';
	import { toast } from '@zerodevx/svelte-toast';
	export let str;
</script>

<div use:copy={str} on:svelte-copy={() => toast.push('String copied to clipboard')}>
	<Button touch color="secondary">
		<Label>copy</Label>
		<Icon class="material-icons">content_copy</Icon>
	</Button>
	<pre>{str}</pre>
</div>
