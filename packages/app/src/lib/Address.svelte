<script>
  import Tooltip, { Wrapper } from '@smui/tooltip';
	import Button, { Label, Icon } from '@smui/button';
	import { copy } from 'svelte-copy';
	import { toast } from '@zerodevx/svelte-toast';
	export let address;
</script>

{#if address}
	<div
		use:copy={address}
		on:svelte-copy={() => toast.push('Address copied to clipboard')}
	>
  <Wrapper>
		<Button style="height:fit-content;" color="secondary"  variant="outlined">
			<Label>{address}</Label>
			<Icon class="material-icons">content_copy</Icon>
		</Button>
    <Tooltip>Copy address to clipboard</Tooltip>
	</Wrapper>
	</div>
{/if}
