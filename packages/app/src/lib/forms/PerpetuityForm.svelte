<script lang="ts">
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import Radio from '@smui/radio';
	import Button from '@smui/button';
	import FormField from '@smui/form-field';
	import { Perpetuity, sanitizeAddress } from '@unspent/phi';
	import { toast } from '@zerodevx/svelte-toast';
	import type { Network } from 'cashscript';

	export let network: Network;
	export let version: number;
	export let contract;
	let options = { network: network, version: version };
	let isPublished = false;

	let showWarning = true;
	let showAdvanced = false;

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
	let decay = 96;
	let executorAllowance = 1500;
	async function createContract() {
		if (receiptAddress) {
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
				if (!showAdvanced) decay = Math.floor(420786 / period);
				contract = new Perpetuity(period, receiptAddress, executorAllowance, decay, options);
			} catch (e: Error) {
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
		A perpetuity contract allows sending a fixed fraction of total value to a predefined address on a
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
			{#if !showAdvanced}
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
			{:else}
				<Textfield
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
				</Textfield>

				<Textfield
					bind:value={decay}
					on:change={() => createContract()}
					type="number"
					input$min="2"
					required
					label="Decay"
				>
					<HelperText slot="helper"
						>The fraction of inputs that should be sent each period. E.g. A decay of two (2)
						dispenses half (1/2) the total each time. A decay of 20 would release 1/20th the value
						each period.</HelperText
					>
				</Textfield>
			{/if}
      <Button
			on:click={() => {
				showAdvanced = !showAdvanced;
			}}
		>
    advanced
		</Button>
		{/if}
	{/if}
</div>
