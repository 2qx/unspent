<script>

   import makeBlockie from 'ethereum-blockies-base64';
	export let lockingBytecode;


</script>

<div>
  <img alt={lockingBytecode} src={makeBlockie(lockingBytecode)} />
</div>

<style>
	div {
    float: right;
		padding: 25px;
		z-index: 1;
	}

  div img {
    height: 100px;
    width: 100px;
  }

	div :global(canvas) {
		/* fit QR to wrapper */

		left: 0;
		top: 0;
	}
</style>
