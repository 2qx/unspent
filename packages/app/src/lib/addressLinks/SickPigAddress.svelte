<script lang="ts">
	import Tooltip, { Wrapper } from '@smui/tooltip';
	import { Icon } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import { Svg } from '@smui/common';

	export let address: string;
	export let network: any;
</script>

<Wrapper>
	{#if network == 'chipnet'}
		<IconButton
			href="https://chipnet.imaginary.cash/address/{address}"
			target="_blank"
			touch
			color="secondary"
			size="button"
		>
			<Icon class="material-icons">travel_explore</Icon>
		</IconButton>
	{:else}
		<IconButton
			href="https://explorer.bitcoinunlimited.info/address/{address}"
			target="_blank"
			touch
			color="secondary"
			size="button"
		>
			<Icon class="material-icons">travel_explore</Icon>
		</IconButton>
	{/if}

	<Tooltip>View on block explorer</Tooltip>
</Wrapper>
