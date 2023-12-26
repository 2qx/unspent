<script>
	import { beforeUpdate } from 'svelte';
	import ContractChart from '$lib/ContractChart.svelte';
	import { Perpetuity } from '@unspent/phi';
	import { receiptAddressStore, stateStore } from '$lib/store.js';
	import ContractChartSection from '$lib/ContractChartSection.svelte';

	let receiptAddress = '';
  let stateValue;
	let series = [];
	let contract;

	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
	});

	stateStore.subscribe((value) => {
		stateValue = Number(value);
		if (stateValue < 5) {
			stateStore.set('5');
		}
	});
</script>

<ContractChartSection {receiptAddress} />
