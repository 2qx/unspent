<script lang="ts">
	import { Annuity, DUST_UTXO_THRESHOLD, sanitizeAddress } from '@unspent/phi';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
  import Button from '@smui/button';
	import Radio from '@smui/radio';
	import FormField from '@smui/form-field';

	import { toast } from '@zerodevx/svelte-toast';
	import type { Network } from 'cashscript';

	export let network: Network;
	export let version: number;
	export let contract;
	let options = { network: network, version: version };

	let isPublished = false;
  let showWarning = true;

	let showHelp = true;

	let periodOptions = [
		{
			name: 'Annually',
			value: 52596,
			disabled: false
		},
		{
			name: 'Quarterly',
			value: 13149,
			disabled: false
		},
		{
			name: 'Monthly',
			value: 4383,
			disabled: false
		},
		{
			name: 'Weekly',
			value: 1011,
			disabled: false
		}
	];

	let period = 4383;
	let receiptAddress = '';
	let installment = NaN;
	let executorAllowance = 1200;
	async function createContract() {
		if (receiptAddress && installment && period) {
			try {
        try {
					receiptAddress = await sanitizeAddress(receiptAddress);
				} catch (e: any) {
					if (e.message) {
						toast.push(e.message, { classes: ['warn'] });
					} else {
						toast.push(e, { classes: ['warn'] });
					}
				}
				contract = new Annuity(period, receiptAddress, installment, executorAllowance, options);
			} catch (e: any) {
				contract = undefined;
				if (e.message) {
					toast.push(e.message, { classes: ['warn'] });
				} else {
					toast.push(e, { classes: ['warn'] });
				}
			}
		}
	}
</script>

<div class="margins">
	<p>
		An annuity contract may send a fixed amount to a predefined address on a
		regular schedule.
	</p>
	{#if showWarning}
		<ul>
			<li>Do <b>NOT</b> use an exchange address as the receipt address.</li>
			<li>Once a contract is funded, the receipt addresses can <b>never be changed</b>.</li>
			<li>Funds sent to the contract <b>cannot be withdrawn prematurely</b>, only as scheduled.</li>
		</ul>

		<Button
			on:click={() => {
				showWarning = false;
			}}
		>
			I understand the risks.
		</Button>
	{:else}
		<Textfield
			bind:value={receiptAddress}
			on:change={() => createContract()}
			style="width: 100%;"
			helperLine$style="width: 100%;"
			type="text"
			required
			label="Receipt Address"
		>
			<HelperText slot="helper">The address to receive a regular payout.</HelperText>
		</Textfield>

		{#if receiptAddress}
			<div class="radio-demo">
				{#each periodOptions as periodOption}
					<FormField>
						<Radio
							on:change={() => createContract()}
							bind:group={period}
							value={periodOption.value}
							touch
						/>
						<span slot="label">{periodOption.name}</span>
					</FormField>
				{/each}
			</div>

			<!--Textfield
			bind:value={period}
			on:change={() => createContract()}
			type="number"
			input$min="1"
			input$max="65535"
			required
			label="Period"
		>
			<HelperText slot="helper">
				How often (in blocks) the contract can pay. e.g. 1 block, ~10 minutes.</HelperText
			>
		</Textfield-->

			<!-- <BlockTimeField bind:blockTime={period} on:message={() => createContract()} /> -->

			<Textfield
				bind:value={installment}
				on:change={() => createContract()}
				type="number"
				input$min="600n"
				required
				label="Installment"
			>
				<HelperText slot="helper">Amount (sats) contract will payout per period.</HelperText>
			</Textfield>
		{/if}
	{/if}
</div>
