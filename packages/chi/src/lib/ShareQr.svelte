<script lang="ts">
	import { page } from '$app/stores';
	import share from '$lib/images/share.svg';
	import { binToBase64 } from '@bitauth/libauth';
	import { deflate } from 'pako';
	import { stateStore } from '$lib/store.js';
	let stateValue;

	export let lockingBytecode: string;

	let linkText;

	if (lockingBytecode) {
		let q = decodeURI(binToBase64(deflate(lockingBytecode)));
		$page.url.searchParams.set('q', q);
		linkText = 'https://' + $page.url.host + '/s?' + $page.url.searchParams.toString();
	}

	stateStore.subscribe((value) => {
		stateValue = Number(value);
	});

	const bumpLevel = async () => {
		if (stateValue < 6) {
			stateStore.set('6');
		}
	};

	
</script>

{#if lockingBytecode}
<div 						>
						<qr-code
						id="qr1"
						contents={linkText}
						module-color="#c1a5d4"
						position-ring-color="#b286cf"
						position-center-color="#b286cf"
						mask-x-to-y-ratio="1.2"
						style="width: 150px;
							height: 150px;
							margin: 1em auto;
							background-color: #fff;"
					>
						<img src={share} slot="icon" />
					</qr-code>
	</div>

{/if}

<style>
	#progress-bar {
		max-width: 70px;
	}

	.hitMe {
		border: 0;
		padding: 15px;
		font-size: 1rem;
		text-align: center;
		color: #b286cf;
		text-shadow: 1px 1px 1px #000;
		border-radius: 50px;
		background-color: rgb(178, 134, 207);
		background-image: linear-gradient(
			to top left,
			rgba(0, 0, 0, 0.2),
			rgba(0, 0, 0, 0.2) 30%,
			rgba(0, 0, 0, 0)
		);
		box-shadow: inset 2px 2px 3px rgba(255, 255, 255, 0.6), inset -2px -2px 3px rgba(0, 0, 0, 0.6);
	}

	@keyframes blinker {
		50% {
			opacity: 0;
		}
	}
</style>
