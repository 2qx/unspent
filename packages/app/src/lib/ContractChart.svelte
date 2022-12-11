<script>
  import { Chart, HistogramSeries } from "svelte-lightweight-charts";
  export let series
  let keys = Object.keys(series)
  let data = []
  let utxo = keys.pop()
  $: data = series[utxo].time.map((e) => {
    return {"time":e, "value": series[utxo].payout.at(series[utxo].time.indexOf(e))}
  });
</script>

{#if data.length>0}
<Chart width={600} height={300}>
  <HistogramSeries data={data}/>
</Chart>
{/if}