<script>
  import Carousel from 'svelte-carousel';
  import { browser } from '$app/environment';
  let pagesCount = 22;
  let pages = Array.from(Array(pagesCount).keys()).map(n => String(n+1).padStart(2, '0'))

  let carousel; // for calling methods of the carousel instance
  
  const handleNextClick = () => {
    carousel.goToNext()
  }
</script>

{#if browser}
  <Carousel
    bind:this={carousel}
>
  
  {#each pages as page}
    <div id=book>
      <img src=/h/{String(page).padStart(2, '0')}.png alt="home" />
    </div>
    
    {/each}
    <div slot="prev">
      <!-- -->
    </div>
    <div slot="next">
      <!-- -->
    </div>
  </Carousel>
{/if}

<button on:click={handleNextClick}>Next</button>

<style>
#book {
align-items: center;
justify-content: center;
display: flex;
}
</style>