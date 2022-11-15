<script lang="ts">
  import Accordion  from '@smui-extra/accordion';
  import ContractPanel from './ContractPanel.svelte';
  export let contractData
</script>

<div class="accordion-container">
  <Accordion class="demo-small-titles">
      {#each contractData as cat (cat.opReturn)}
          <ContractPanel bind:data={cat} />
      {/each}
  </Accordion>
</div>
 

 
<style>

  *
    :global(.demo-small-titles
      .smui-accordion__header__title--with-description) {
    flex-basis: 20% !important;
    max-width: 200px !important;
  }
  
  .accordion-container {
    width:100%;
  }
</style>