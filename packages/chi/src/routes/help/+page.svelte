<script>
  import Carousel from 'svelte-carousel';
  import { browser } from '$app/environment';
  let pagesCount = 23;
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
      <img width="100%" src=/h/{String(page).padStart(2, '0')}.svg alt="home" />
    </div>
    
    {/each}

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