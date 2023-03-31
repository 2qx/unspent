<script lang="ts">
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';
  import Button from '@smui/button';
	import HelperText from '@smui/textfield/helper-text';

	import { createEventDispatcher } from 'svelte';

	export let value: string | null = null;

	const dispatch = createEventDispatcher();



	function handleChange() {
		dispatch('searchAddressChange', {
			text: value
		});
	}
</script>

<Textfield
	class="shaped-outlined"
	variant="outlined"
	bind:value
	on:change={() => handleChange()}
	label="Search"
>

  <HelperText slot="helper">Search by Address</HelperText>
	
  <svelte:fragment slot="trailingIcon">
    {#if value}
    <Button on:click={() => value=null}>
      <Icon class="material-icons">delete</Icon>
    </Button>
    
      {:else}
      <Icon class="material-icons" >search</Icon>
    {/if}
  </svelte:fragment>
</Textfield>
