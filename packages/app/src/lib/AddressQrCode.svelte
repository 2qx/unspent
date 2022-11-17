<script>
	import { afterUpdate } from 'svelte';
	import QRCode from 'easyqrcodejs';

	export let codeValue;
	let node;
	let qr;

	afterUpdate(() => {
		if (qr) {
			qr.clear();
		}

		if (codeValue) {
			const options = {
				text: codeValue,
				width: 100,
				height: 100,
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
