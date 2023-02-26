<script lang="ts">
	import { beforeUpdate } from 'svelte';
	import Tooltip, { Wrapper } from '@smui/tooltip';
	import { Icon } from '@smui/button';
	import IconButton from '@smui/icon-button';

	export let instance;
	let legacyAddress: string;

	beforeUpdate(async () => {
		// This fixes a bug related to the contract switch where old contracts appear
		legacyAddress = await instance.getLegacyAddress();
	});
</script>

<Wrapper>
	<IconButton
		href="https://bitinfocharts.com/bitcoin%20cash/address/{legacyAddress}"
		target="_blank"
		touch
		color="secondary"
		size="button"
	>
		<Icon class="material-icons">egg</Icon>
	</IconButton>
	<Tooltip>View on BitInfoCharts</Tooltip>
</Wrapper>
