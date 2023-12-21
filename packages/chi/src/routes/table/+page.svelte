<script>
	import UtxoSection from '$lib/UtxoSection.svelte';
	import { receiptAddressStore } from '$lib/store.js';

	let receiptAddress;
	receiptAddressStore.subscribe((value) => {
		receiptAddress = value;
	});
</script>

<UtxoSection {receiptAddress} />
