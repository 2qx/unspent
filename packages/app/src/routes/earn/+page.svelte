<script>
	import { binToHex } from '@bitauth/libauth';
	import Card from '@smui/card';
	import Select, { Option } from '@smui/select';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import { onMount } from 'svelte';
	import { load } from '$lib/machinery/loader-store.js';
	import { getRecords, parseOpReturn } from '@unspent/phi';
	import { ElectrumNetworkProvider } from 'cashscript';
	import {
		getDefaultProvider,
		opReturnToExecutorAllowance,
		opReturnToSpendableBalance
	} from '@unspent/phi';
	//import ContractItem from '$lib/ContractItem.svelte';
	import ContractAccordion from '$lib/ContractAccordion.svelte';
	import { protocol, chaingraphHost, node, executorAddress } from '$lib/store.js';

	let contractData = [];

	let pageSizes = [5, 10, 25, 50];
	let pageSize = 10;
	let page = 0;

	let executorAddressValue = '';
	let protocolValue = '';
	let chaingraphHostValue = '';
	let nodeValue = '';
  let blockHeight = 0;

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

	const zeroPage = async () => {
		page = 0;
		contractData = [];
		await loadContracts();
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
      let networkProvider = getDefaultProvider('mainnet');
      if(blockHeight<1) blockHeight = await networkProvider.getBlockHeight();
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
				let tmpData = contractHex.map((x) => parseOpReturn(x));
				let networkProvider = getDefaultProvider('mainnet');
				

				let dataPromises = await tmpData.map(async (data) => {
					let opReturn = binToHex(data.opReturn);
					data.executorAllowance = opReturnToExecutorAllowance(opReturn);
					data.spendable = await opReturnToSpendableBalance(
						opReturn,
						'mainnet',
						networkProvider,
						blockHeight
					);
					return data;
				});
				await Promise.all(dataPromises).then(function (results) {
					contractData = results;
				});
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
						<Select
							style="max-width: 100px"
							variant="outlined"
							bind:value={pageSize}
							on:click={zeroPage}
							noLabel
						>
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
					<br />
					{#if contractData.length == 0}
						<div style="display: flex; justify-content: center">
							<CircularProgress style="height: 48px; width: 48px;" indeterminate />
						</div>
					{/if}
					<ContractAccordion bind:contractData />
					<br />
					<div id="pager">
						<Select
							style="max-width: 100px"
							variant="outlined"
							bind:value={pageSize}
							on:click={zeroPage}
							noLabel
						>
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
