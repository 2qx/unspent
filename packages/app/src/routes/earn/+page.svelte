<script>
	import Card from '@smui/card';
	import { onMount } from 'svelte';
	import { load } from '$lib/machinery/loader-store.js';
	import { getRecords, parseOpReturn } from '@unspent/phi';
	//import ContractItem from '$lib/ContractItem.svelte';
	import ContractAccordian from '$lib/ContractAccordian.svelte';
	import { protocol, chaingraphHost, node, executorAddress } from '$lib/store.js';
	let contractData = [];

	let pageSizes = [5, 10, 25, 50];
	let pageSize = 5;
	let page = 0;

	let executorAddressValue = '';
	let protocolValue = '';
	let chaingraphHostValue = '';
	let nodeValue = '';

	executorAddress.subscribe((value) => {
		executorAddressValue = value;
	});

	protocol.subscribe((value) => {
		protocolValue = value;
	});
	chaingraphHost.subscribe((value) => {
		chaingraphHostValue = value;
	});
	node.subscribe((value) => {
		nodeValue = value;
	});

	const incrementPage = () => {
		page += 1;
		loadContracts();
	};

	const decrementPage = () => {
		page -= 1;
		loadContracts();
	};

	onMount(async () => {
		if (chaingraphHostValue.length > 0) {
			loadContracts();
		}
	});
	const loadContracts = async () => {
		await load({
			load: async () => {
				let protocolHex = protocolValue
					.split('')
					.map((el) => el.charCodeAt(0).toString(16))
					.join('');
				let contractHex = await getRecords(
					chaingraphHostValue,
					'6a04' + protocolHex,
					nodeValue,
					pageSize,
					page * pageSize
				);
				contractData = contractHex.map((x) => parseOpReturn(x));
			}
		});
	};
</script>

<svelte:head>
	<title>Contracts</title>
	<meta name="description" content="Unspent app" />
</svelte:head>
<section>
	{#if !executorAddressValue}
		<p><b>No cashaddress specified, fee will go to miners.</b></p>
	{/if}
</section>
<section>
	<div class="card-display">
		<div class="card-container">
			<Card class="demo-spaced">
				<div class="margins">
					<div id="pager">
						<button id="pagerButton" on:click={decrementPage} disabled={page == 0}> ← </button>
						<select bind:value={pageSize} on:change={loadContracts}>
							{#each pageSizes as pageSize}
								<option value={pageSize}>
									{pageSize}
								</option>
							{/each}
						</select>
						<button id="pagerButton" on:click={incrementPage}> → </button>
						<span>
							{#if chaingraphHostValue.length == 0}
								No Chaingraph endpoint specified.
							{/if}
						</span>
					</div>
					<h1>Spend Unspent Contracts</h1>
					<ContractAccordian bind:contractData />
				</div>
			</Card>
		</div>
	</div>
</section>

<style>
	* :global(.margins) {
		margin: 18px 10px 24px;
	}

	#pager {
		display: flex;
		flex-direction: row;
		justify-content: right;
	}
	#pagerButton {
		max-height: 58px;
	}
</style>
