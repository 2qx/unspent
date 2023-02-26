<script lang="ts">
	import ImageList, { Item } from '@smui/image-list';
	import { Confetti } from 'svelte-confetti';
	export let response;
	let results = response
		.map((r) => {
			return {
				txid: r.transaction_hash.slice(2),
				vout: r.output_index,
				satoshis: r.value_satoshis
			};
		})
		.reverse();

	function getUnevenImageSize(
		counter: number,
		base: number,
		variance: number,
		preAdd = (num: number) => num
	) {
		const mid = (counter % 2 ? Math.cos : Math.sin)(counter) * variance;
		return base + Math.floor(preAdd(mid));
	}
</script>

<h3>Donations:</h3>
{#if results}
	<ImageList class="my-image-list-masonry" style="min-height:1000px;" masonry>
		{#each results as txo}
			<Item>
				<div class="tract" style="height:{getUnevenImageSize(txo.satoshis, 80, 120, Math.abs)}px">
					<h2>
						🍊 {txo.satoshis.toLocaleString()}
						<Confetti
							x={[-Math.random() * 1, Math.random() * 1]}
							y={[-Math.random() * 1, Math.random() * 1]}
							delay={[5000, Math.random() * 5000 + 5000]}
							colorArray={['#0F0', '#F0F']}
							amount="100"
						/>
					</h2>

					<a target="_blank" href="https://explorer.bitcoinunlimited.info/tx/{txo.txid}"
						>Transaction</a
					>
				</div>
			</Item>
		{/each}
	</ImageList>
{/if}

<style>
	.tract {
		align-items: center;
		background: rgb(207, 237, 250);
		border-radius: 30px;
		padding: 10px;
	}
	.tract h2 {
		font-weight: 600;
		color: rgb(148, 87, 1);
		text-align: right;
	}
	.tract a {
		font-weight: 400;
		color: rgb(148, 87, 1);
	}
</style>
