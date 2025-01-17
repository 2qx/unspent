<script lang="ts">
	import Card from '@smui/card';

	import TlvChart from '$lib/TlvChart.svelte';
	export let data;
</script>

<svelte:head>
	<title>Statistics</title>
	<meta name="description" content="Statistics" />
</svelte:head>
<div class="card-display">
	<div class="card-container">
		<Card class="demo-spaced">
			<div class="margins">
				<TlvChart bind:series={data.series} />
			</div>
      <div style="padding:30px">
        <p>Aggregate statistics of all unspent phi contracts. Data tabulated weekly.</p>
			<p>Every funded open contract counted as monthly active user (MAU) total.</p>
      </div>
		</Card>
		
	</div>
</div>

<style>
</style>
