<script>
  import DataTable, { Head, Body, Row, Cell, Label } from '@smui/data-table';
  import Checkbox from '@smui/checkbox';
	export let utxos;
  let selected = [];
  console.log(utxos[0])
</script>

<p>Unspent Transaction Outputs</p>

<DataTable style="width: 100%;">
  <Head>
    <Row>
      <Cell>Spend</Cell>
      <Cell >Satoshi</Cell>
      <Cell numeric>Height</Cell>
      <Cell columnId="outpoint" style="width: 50%;">
        <Label>Outpoint</Label>
      </Cell>
    </Row>
  </Head>
  <Body>
    {#each utxos as utxo (utxo.key)}
      <Row>
        <Cell checkbox>
          <input type="checkbox" bind:checked={utxo.use} />
        </Cell>
        <Cell >{utxo.satoshis.toLocaleString()}</Cell>
        <Cell numeric>{utxo.height}</Cell>
        <Cell ><pre>{utxo.key}</pre></Cell>
      </Row>
    {/each}
  </Body>
</DataTable>

