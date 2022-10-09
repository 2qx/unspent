<script>
    export let utxos;
</script>

<p>Unspent Transaction Outputs</p>
<table>
<tr>
	<td></td>
	<td class="right"><b>Satoshi</b></td>
	<td><i>Height</i></td>
	<td>Transaction Hash</td>
	<td><i>Output</i></td>
</tr>
{#each utxos as utxo}
<tr>
	<td><input type=checkbox bind:checked={utxo.use}></td>
	<td class="right"><b> {utxo.satoshis} </b> </td>
	<td> <i>{utxo.height} </i> </td>
	<td class="break"> {utxo.txid}       </td>
	<td> <i>{utxo.vout}</i>       </td>
</tr>
{/each}
</table>


<style>
	.right {
		text-align: right;
	}
</style>