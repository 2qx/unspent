<script lang="ts">
	import Tooltip, { Wrapper } from '@smui/tooltip';
	import { Icon } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import { Svg } from '@smui/common';

	export let address: string;
</script>

<Wrapper>
	<IconButton
		href="https://explorer.bitcoinunlimited.info/address/{address}"
		target="_blank"
		touch
		color="secondary"
		size="button"
	>
		<Icon class="material-icons">travel_explore</Icon>
	</IconButton>
	<Tooltip>View on block explorer</Tooltip>
</Wrapper>
