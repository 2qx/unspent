<script>
	import Card from '@smui/card';
	import Select, { Option } from '@smui/select';
	import IconButton from '@smui/icon-button';
	import { Label } from '@smui/common';
	import CircularProgress from '@smui/circular-progress';
	import { onMount } from 'svelte';
	import { load } from '$lib/machinery/loader-store.js';
	import { getRecords, parseOpReturn } from '@unspent/phi';
	//import ContractItem from '$lib/ContractItem.svelte';
	import ContractAccordian from '$lib/ContractAccordian.svelte';
	import { protocol, chaingraphHost, node, executorAddress } from '$lib/store.js';
	let contractData = [];

	let pageSizes = [5, 10, 25, 50];
	let pageSize = 25;
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

	const zeroPage = () => {
		page = 0;
    contractData = []
		loadContracts();
	};

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
	<div class="card-display">
		<div class="card-container">
			<Card class="demo-spaced">
				<div class="margins">
					
					<h1>Spend Unspent Contracts</h1>
          <div id="pager">
						<Select variant="outlined" bind:value={pageSize} on:blur={zeroPage} noLabel>
							{#each pageSizes as pageSize}
								<Option value={pageSize}>
									{pageSize}
								</Option>
							{/each}
						</Select>
						<IconButton
							class="material-icons"
							action="first-page"
							title="First page"
							on:click={zeroPage}
							disabled={page === 0}>first_page</IconButton
						>
						<IconButton
							class="material-icons"
							action="prev-page"
							title="Prev page"
							on:click={decrementPage}
							disabled={page === 0}>chevron_left</IconButton
						>

						<IconButton
							class="material-icons"
							action="next-page"
							title="Next page"
							on:click={incrementPage}>chevron_right</IconButton
						>
						<span>
							{#if chaingraphHostValue.length == 0}
								No Chaingraph endpoint specified.
							{/if}
						</span>
					</div>
          <br>
					{#if contractData.length == 0}
						<div style="display: flex; justify-content: center">
							<CircularProgress style="height: 48px; width: 48px;" indeterminate />
						</div>
					{/if}
					<ContractAccordian bind:contractData />
          <br>
          <div id="pager">
						<Select variant="outlined" bind:value={pageSize} on:blur={zeroPage} noLabel>
							{#each pageSizes as pageSize}
								<Option value={pageSize} >
									{pageSize}
								</Option>
							{/each}
						</Select>
						<IconButton
							class="material-icons"
							action="first-page"
							title="First page"
							on:click={zeroPage}
							disabled={page === 0}>first_page</IconButton
						>
						<IconButton
							class="material-icons"
							action="prev-page"
							title="Prev page"
							on:click={decrementPage}
							disabled={page === 0}>chevron_left</IconButton
						>

						<IconButton
							class="material-icons"
							action="next-page"
							title="Next page"
							on:click={incrementPage}>chevron_right</IconButton
						>
						<span>
							{#if chaingraphHostValue.length == 0}
								No Chaingraph endpoint specified.
							{/if}
						</span>
					</div>
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

</style>
