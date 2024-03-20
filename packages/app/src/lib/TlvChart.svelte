<script>
	import { afterUpdate } from 'svelte';
	import { Chart, HistogramSeries, LineSeries } from 'svelte-lightweight-charts';
	export let series;
	let chartApi;

	let data = [];
	$: data = {
		fiat: series.map((p) => ({ time: p.time, value: p.fiat })),
		bch: series.map((p) => ({ time: p.time, value: p.bch })),
		mau: series.map((p) => ({
			time: p.time,
			value: p.mau
		}))
	};

	afterUpdate(() => {
		//chartApi.timeScale().fitContent();
	});

	let observer;
  let options={
    rightPriceScale: {
            visible: true,
            autoScale: true,
            borderColor: 'rgba(197, 203, 206, 1)',
        },
        leftPriceScale: {
            visible: true,
            autoScale: true,
            borderColor: 'rgba(197, 203, 206, 1)',
        },
        width:600,
        height:900
        
  }
	
</script>

{#if Object.keys(data).length > 0}
	<div>
    <div id="key">
			<div id="fiat">Fiat</div>
			<div id="bch">BCH</div>
			<div id="mau">MAU</div>
		</div>
		<Chart
      {...options}
			container={{ class: 'chart' }}
		>
			<LineSeries data={data.fiat} priceScaleId='left' color="#9ec69e94" reactive={true} />
			<LineSeries data={data.bch} priceScaleId='right' color="#0f0" reactive={true} />
			<LineSeries data={data.mau} priceScaleId='right' color="#f0f" reactive={true} />
		</Chart>
		
	</div>
{/if}

<style>
	#key {
		padding: 2px;
		font-size: small;
		width: 100%;
	}
	#mau {
		background-color: #f0f;
		color: #fff;
		padding: 3px;
    position: absolute;
    right: 30%;
    z-index: 100;
	}
	#bch {
		background-color: #0f0;
		padding: 3px;
    position: absolute;
    right: 30%;
    top: 100px;
    z-index: 100;
	}

	#fiat {
		background-color: #9ec69e94;
		padding: 3px;
    position: absolute;
    z-index: 100;
	}
  :global(.chart) {
		width: 100%;
		height: 900px;
	}
</style>
