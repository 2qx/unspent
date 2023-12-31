<script lang="ts">
	import { page } from '$app/stores';
	import share from '$lib/images/share.svg';
	import CopyToClipboard from './CopyToClipboard.svelte';
	import { toast } from '@zerodevx/svelte-toast';
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

	const handleClick = async () => {
		toast.push('link copied');
	};
</script>

{#if lockingBytecode}
	<CopyToClipboard on:copy={handleClick} text={linkText} let:copy>
		<div class="action" on:click={bumpLevel}>
			<button class="hitMe" on:click={copy}>
				<img src={share} alt="share" />
			</button>
		</div>
	</CopyToClipboard>
{/if}

<style>
	#progress-bar {
		max-width: 70px;
	}

	.hitMe {
		border: 0;
		line-height: 2.5;
		padding: 15px;
		font-size: 1rem;
		text-align: center;
		color: #fff;
		text-shadow: 1px 1px 1px #000;
		border-radius: 10px;
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
