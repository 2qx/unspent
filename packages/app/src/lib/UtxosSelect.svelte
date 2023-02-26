<script>
	import DataTable, { Head, Body, Row, Cell, Label } from '@smui/data-table';
	import Checkbox from '@smui/checkbox';
	export let utxos;
	let selected = [];

	$: utxos = utxos.map((utxo) => {
		utxo.use = selected.includes(utxo.key);
		if (utxo.use) console.log(utxo.key);
		return utxo;
	});
</script>

<p>Unspent Transaction Outputs</p>

<DataTable style="width: 100%;">
	<Head>
		<Row>
			<Cell style="width: 10%;" checkbox>
				<Checkbox />
			</Cell>
			<Cell style="width: 15%;" numeric>Height</Cell>
			<Cell style="width: 20%;">Satoshi</Cell>
			<Cell columnId="outpoint" style="width: 55%;">
				<Label>Outpoint</Label>
			</Cell>
		</Row>
	</Head>
	<Body>
		{#each utxos as utxo (utxo.key)}
			<Row>
				<Cell checkbox>
					<Checkbox bind:group={selected} value={utxo.key} valueKey={utxo.key} />
					<!-- <input type="checkbox" bind:checked={utxo.use} /> -->
				</Cell>
				<Cell numeric>{utxo.height}</Cell>
				<Cell numeric>{utxo.satoshis.toLocaleString()}</Cell>
				<Cell><pre>{utxo.key}</pre></Cell>
			</Row>
		{/each}
	</Body>
</DataTable>
