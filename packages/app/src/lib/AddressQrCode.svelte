<script>
	import { afterUpdate } from 'svelte';
	import QRCode from 'easyqrcodejs';

	export let codeValue;
  export let size;
	let node;
	let qr;

	afterUpdate(() => {
		if (qr) {
			qr.clear();
		}

    size = size ? size : 100
    
		if (codeValue) {
			const options = {
				text: codeValue,
				width: size,
				height: size,
				quietZone: 10
			};
			qr = new QRCode(node, options);
		}
	});
</script>

<div bind:this={node} />

<style>
	div {
		float: right;
		padding: 10px;
		z-index: 1;
	}
	div :global(canvas) {
		/* fit QR to wrapper */

		left: 0;
		top: 0;
	}
</style>
