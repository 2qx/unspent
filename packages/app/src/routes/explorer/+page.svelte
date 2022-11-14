<script lang="ts">
	import {
		mdiHuman,
		mdiGestureTap,
		mdiMonitorScreenshot,
		mdiPalette,
		mdiCommentArrowLeft,
		mdiAccountGroup,
		mdiRotateRightVariant,
		mdiClipboardCheck,
		mdiLanguageTypescript
	} from '@mdi/js';
	import { siMaterialdesign, siSvelte, siSass } from 'simple-icons/icons';
	import Paper, { Title, Content } from '@smui/paper';
	import List, { Item, Graphic, Text, PrimaryText, SecondaryText } from '@smui/list';
	import { Icon, Svg } from '@smui/common';
	import LockingBytecodeDetail from '$lib/LockingBytecodeDetails.svelte';
	import TransactionDetail from '$lib/TransactionDetail.svelte';
	export let data: any;
</script>

<Paper class="box">
	<Title style="display: flex; justify-content: space-between; ">
		<span>
			{#if data.tx}
				{data.tx}
			{/if}
			{#if data.lockingBytecode}
				{data.lockingBytecode}
			{/if}
		</span>
	</Title>
	<Content>
		{#if data.tx}
			<TransactionDetail bind:txid={data.tx} />
		{/if}
		{#if data.lockingBytecode}
			<LockingBytecodeDetail bind:lockingBytecode={data.lockingBytecode} />
		{/if}
	</Content>
</Paper>
