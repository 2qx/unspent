<script>
  /**
   * Indicates if dot is active
   */
  export let active = false
  export let disabled = false

  /**
   * Symbol to show
   */
  export let symbol = ''
</script>

<div
  class="custom-dot__dot-container"
  class:custom-dot__dot-container_active={active}
  class:custom-dot__dot-container_disabled={disabled}
  on:click
>
  <span class="custom-dot__symbol">{symbol}</span>
</div>

<style>
  .custom-dot__dot-container {
    height: 20px;
    width: 20px;
    background-color: #727272;
    border-radius: 50%;
    opacity: 0.7;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .custom-dot__dot-container:hover {
    opacity: 0.9;
  }
  .custom-dot__dot-container_active {
    background-color: #67a323;
  }
  .custom-dot__dot-container_disabled {
    background-color: #b1b1b1;
    height: 10px;
    width: 10px;
  }
  .custom-dot__symbol {
    font-size: 12px;
    color: #eaeaea;
  }
</style>