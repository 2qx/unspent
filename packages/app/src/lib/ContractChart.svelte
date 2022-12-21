<script>
	import { afterUpdate } from 'svelte';
	import { Chart, HistogramSeries, LineSeries } from 'svelte-lightweight-charts';
	export let series;
	let chartApi;

	let data = [];
	$: data = {
		principal: series.time.map((time, index) => ({ time: time, value: series.principal[index] })),
		payout: series.time.map((time, index) => ({ time: time, value: series.payout[index] })),
		executorAllowance: series.time.map((time, index) => ({
			time: time,
			value: series.executorAllowance[index]
		}))
	};

	afterUpdate(() => {
		chartApi.timeScale().fitContent();
	});

	let observer;
	let width = 600;
	let height = 300;
	let handleContainerReference = (element) => {
		if (observer) {
			observer.disconnect();
		}
		if (!element) {
			return;
		}
		observer = new ResizeObserver(([entry]) => {
			width = entry.contentRect.width;
			height = entry.contentRect.height;
		});
		observer.observe(element);
	};
</script>

{#if Object.keys(data).length > 0}
	<div>
		<Chart
			{width}
			{height}
			ref={(ref) => (chartApi = ref)}
			container={{ class: 'chart', ref: handleContainerReference }}
		>
			<HistogramSeries data={data.principal} color="#9ec69e94" reactive={true} />
			<LineSeries data={data.payout} color="#0F0" reactive={true} />
			<LineSeries data={data.executorAllowance} color="#F0F" reactive={true} />
		</Chart>
	</div>
{/if}

<style>
	:global(.chart) {
		width: 100%;
		height: 400px;
	}
</style>