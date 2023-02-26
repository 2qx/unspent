<script lang="ts">
	import Accordion from '@smui-extra/accordion';
	import ContractPanel from './ContractPanel.svelte';

	import Contract from './Contract.svelte';
	export let contractData;
</script>

<div class="accordion-container">
	<Accordion class="demo-small-titles">
		{#each contractData as data (data.opReturn)}
			<ContractPanel bind:data />
		{/each}
	</Accordion>
</div>

<style>
	* :global(.demo-small-titles .smui-accordion__header__title--with-description) {
		flex-basis: 20% !important;
		max-width: 200px !important;
		overflow: visible;
	}

	.accordion-container {
		width: 100%;
		overflow: visible;
	}
</style>
