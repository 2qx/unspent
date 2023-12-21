<script>
	import { beforeUpdate } from 'svelte';
	import ContractChart from '$lib/ContractChart.svelte';
	import { Perpetuity } from '@unspent/phi';
	import { receiptAddressStore } from '$lib/store.js';
	import ContractChartSection from '$lib/ContractChartSection.svelte';

	let receiptAddress = '';
	let series = [];
	let contract;

	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
	});

	
</script>
<ContractChartSection receiptAddress={receiptAddress}/>
