<script lang="ts">
	import { onMount } from 'svelte';

	import { binToHex } from '@bitauth/libauth';

	import {
		getDefaultProvider,
		opReturnToExecutorAllowance,
		opReturnToSpendableBalance,
		opReturnToBalance,
		parseOpReturn,
		sum,
		BaseUtxPhiContract
	} from '@unspent/phi';
	import { PsiNetworkProvider } from '@unspent/psi';

	import Card from '@smui/card';
	import Select, { Option } from '@smui/select';
	import IconButton from '@smui/icon-button';
	import LinearProgress from '@smui/linear-progress';

	//import ContractItem from '$lib/ContractItem.svelte';
	import ContractAccordion from '$lib/ContractAccordion.svelte';
	import { protocol, chaingraphHost, node, executorAddress } from '$lib/store.js';

	let contractData: any[] = [];
	let isLoading = true;
	let buffered = 0;
	let progress = 0;
	let tlv = '';
	let noResults = false;

	let pageSizes = [5, 10, 25, 50, 100, 500];
	let pageSize = 500;
	let page = 0;

	let executorAddressValue = '';
	let protocolValue = '';
	let chaingraphHostValue = '';
	let nodeValue = '';
	let blockHeight = 0;
	let psiNetworkProvider: PsiNetworkProvider;

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
			if (!psiNetworkProvider)
				psiNetworkProvider = new PsiNetworkProvider('mainnet', chaingraphHostValue, [networkProvider], 500);
			if (blockHeight < 1) blockHeight = await networkProvider.getBlockHeight();
			loadContracts();
		}
	});
	const loadContracts = async () => {
		isLoading = true;
		buffered = 0;
		progress = 0;
		let protocolHex = protocolValue
			.split('')
			.map((el) => el.charCodeAt(0).toString(16))
			.join('');
		let searchFilterParams = {
			prefix: '6a04' + protocolHex,
			node: nodeValue,
			limit: pageSize,
			offset: page * pageSize
		};
		let contractHex = await psiNetworkProvider.search(searchFilterParams);
		let tmpData = contractHex.map((x: string) => parseOpReturn(x));
		let balPromises = tmpData.map(async (data) => {
			return BaseUtxPhiContract.getBalance(data.address, psiNetworkProvider);
		});

		tlv = await Promise.all(balPromises).then((results) => {
			return results.reduce(sum, 0).toLocaleString();
		});

		buffered = 1;
		if (tmpData.length === 0) {
			noResults = true;
		} else {
			noResults = false;
		}

		let dataPromises = await tmpData.map(async (data) => {
			let opReturn = binToHex(data.opReturn);
			data.executorAllowance = opReturnToExecutorAllowance(opReturn);

			// adjust the progress per output, with a little bit of fuzz to make it visible.
			setTimeout(() => {
				progress += 1 / pageSize;
			}, 300 + Math.floor(Math.random() * 1000));

			data.spendable = await opReturnToSpendableBalance(
				opReturn,
				'mainnet',
				psiNetworkProvider,
				blockHeight
			);

			return data;
		});

		await Promise.all(dataPromises).then(function (results) {
			contractData = results;
		});

		isLoading = false;
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
					<p>pg. {page}</p>

					<p>TLV: {tlv}</p>
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
							ripple={false}
							on:click={incrementPage}>chevron_right</IconButton
						>
						<span>
							{#if chaingraphHostValue.length == 0}
								No Chaingraph endpoint specified.
							{/if}
						</span>
					</div>
					{#if isLoading}
						<div style="display: flex; padding: 5px; justify-content: center">
							<LinearProgress {progress} buffer={buffered} />
						</div>
					{/if}
					{#if contractData.length > 0}
						<ContractAccordion bind:contractData />
					{/if}
					{#if noResults}
						<p>No Results</p>
					{/if}
					<br />
					{#if contractData.length > 0}
						{#if isLoading}
							<div style="display: flex; justify-content: center">
								<LinearProgress {progress} buffer={buffered} />
							</div>
						{/if}
					{/if}

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
							ripple={false}
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
