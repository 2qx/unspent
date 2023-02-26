<script lang="ts">
	import { afterUpdate } from 'svelte';
	import makeBlockie from 'ethereum-blockies-base64';

	import QRCode from 'easyqrcodejs';

	export let codeValue: string;
	export let lockingBytecode: string;
	export let prefix: string;
	export let type: string;
	export let backgroundImage: string;
	export let size: number;

	let node;
	let qr;

	afterUpdate(() => {
		if (qr) {
			qr.clear();
		}

		size = size ? size : 300;

		if (codeValue) {
			const options = {
				backgroundImage: backgroundImage, // Background Image
				backgroundImageAlpha: 0.2, // Background image transparency, value between 0 and 1. default is 1.
				autoColor: true,
				PO: '#550055', // Global Posotion Outer color. if not set, the defaut is `colorDark`
				PI: '#005500',
				timing: '#005500',
				title: prefix,
				titleFont: 'normal normal normal 15px Arial',
				titleHeight: 30,
				titleTop: 12,
				subTitle: type, // content
				subTitleFont: 'normal normal bold 15px Arial',
				subTitleTop: 25, // draws y coordinates. default is 0
				text: codeValue,
				width: size,
				height: size,
				dotScale: 0.7,
				quietZone: 30,
				quietZoneColor: '#FF00FF33',
				logo: makeBlockie(lockingBytecode),
				logoWidth: 50,
				logoHeight: 50
			};

			qr = new QRCode(node, options);
		}
	});
</script>

<div bind:this={node} />

<style>
	div {
		margin: auto;
		z-index: 1;
		text-align: center;
	}
</style>
