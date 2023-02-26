<script lang="ts">
	import Icon from '@smui/textfield/icon';
	import { mdiDelete } from '@mdi/js';
	import Fab, { Icon as FabIcon } from '@smui/fab';
	import { Svg } from '@smui/common';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let address: string;
	export let index: number;
	function rmAddress() {
		dispatch('message', {
			addressIdx: index
		});
	}

	function change() {
		dispatch('message', {});
	}
</script>

{#if index <= 1}
	<Textfield
		bind:value={address}
		on:change={() => change()}
		style="width: 100%;"
		helperLine$style="width: 100%;"
		type="text"
	>
		<HelperText slot="helper">A cashaddress (P2PHK or P2SH).</HelperText>
	</Textfield>
{/if}

{#if index > 1}
	<Textfield bind:value={address} on:change={() => change()} style="width: 100%;" type="text">
		<Icon class="material-icons" tabindex="0" slot="trailingIcon">
			<Fab on:click={rmAddress}>
				<FabIcon component={Svg} viewBox="2 2 20 20">
					<path d={mdiDelete} />
				</FabIcon>
			</Fab>
		</Icon>
		<HelperText slot="helper">A cashaddress (P2PHK or P2SH).</HelperText>
	</Textfield>
{/if}
<!-- {#if index > 1}
<Fab
    on:click={rmAddress}
    mini
  >
    <Icon class="material-icons">delete</Icon>
  </Fab>
{/if} -->
