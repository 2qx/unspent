<script>
  import Button, { Label, Icon } from '@smui/button';
	import { copy } from 'svelte-copy';
	import { toast } from '@zerodevx/svelte-toast';
	export let address;
</script>
<div
use:copy={{ text: address , events: ['touchstart', 'mouseenter']}}
on:svelte-copy={() => toast.push('Address copied to clipboard')}
>
<Button touch color="secondary"
>
  <Label>copy</Label>
  <Icon class="material-icons">content_copy</Icon>
</Button>
<pre>{address}</pre>
</div>

