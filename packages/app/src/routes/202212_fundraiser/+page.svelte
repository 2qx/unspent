<script>
	import { beforeUpdate } from 'svelte';
	import { assets } from '$app/paths';
	import { load } from '$lib/machinery/loader-store.js';
	import LinearProgress from '@smui/linear-progress';
	import Card from '@smui/card';
	import { Confetti } from 'svelte-confetti';
	import { ElectrumNetworkProvider } from 'cashscript';
	import { deriveLockingBytecodeHex } from '@unspent/phi';

	import Donations from '$lib/Donations.svelte';
	import AddressQrCode from '$lib/AddressQrCode.svelte';

	const cashaddr = 'bitcoincash:qz7xjt4xcpdu2gl75vrvkpwzfpjhy9hnm55gwzyvj4';
	let lockingBytecode = deriveLockingBytecodeHex(cashaddr);

	let goal = 4400000000;
	let goalText = goal.toLocaleString();
	let balance = 0;
	let balanceText = '';
	let percentDone = '';
	let isSuccess = false;

	beforeUpdate(async () => {
		// This fixes a bug related to the contract switch where old contracts appear
		if (!balance) await updateBalance();
	});

	const updateBalance = async () => {
		await load({
			load: async () => {
				if (cashaddr) balance = await getBalance(cashaddr);
				balanceText = balance.toLocaleString();
				percentDone = ((balance / goal) * 100).toFixed(4);
				isSuccess = balance > 6400000000 ? true : false;
			}
		});
	};

	const getBalance = async (cashaddr) => {
		let e = new ElectrumNetworkProvider();
		let utxos = await e.getUtxos(cashaddr);
		let balance = utxos
			.map((o) => {
				return o.satoshis;
			})
			.reduce((a, b) => a + b, 0);
		return balance;
	};
</script>

<svelte:head>
	{#if isSuccess}
		<title>💚 ₿∙ϕ 🎉 🥳</title>
	{:else}
		<title>💚 ₿∙ϕ ...</title>
	{/if}
</svelte:head>

{#if isSuccess}
	<div
		style="
position: fixed;
top: -50px;
left: 0;
height: 100vh;
width: 100vw;
display: flex;
justify-content: center;
overflow: hidden;
pointer-events: none;"
	>
		<Confetti
			x={[-5, 5]}
			y={[0, 0.1]}
			delay={[500, 2000]}
			colorArray={['#0F0', '#F0F']}
			duration="5000"
			amount="400"
			fallDistance="100vh"
		/>
	</div>
{/if}

<section>
	<div class="card-display">
		<div class="card-container">
			<Card class="demo-spaced">
				<div class="margins">
					<h1>Welcome to the Unspent Phi Inaugural Fundraising Campaign.</h1>

					<table>
						<tr>
							<td>
								<img src="{assets}/dev/stereoscopic.png" alt="Orange Grove" />
							</td>
						</tr>
						<caption style="caption-side: bottom;"
							>Howdy Do, Partner?! This here's a tangerine n' cowboy themed fundraiser. 🤠 🍊
						</caption>
					</table>

					{#if cashaddr}
						<AddressQrCode size={200} codeValue={cashaddr} />
					{/if}
					<p>
						This fundraiser is to support the further development of an open-source ecosystem around
						anyone-can-spend utxo contracts. A fraction of money donated will <i>also</i> be forwarded
						to support the software and tools this app depends on. At present, the app uses generic backend
						infrastructure (fulcrum/chaingraph), but some of the budget will be set aside to run dedicated
						deployments of those generic services.
					</p>
					<p>
						The goal is to raise at least {goalText} satoshis (64 BCH) by the end of 2022. However, given
						the nature of the markets Bitcoin Cash is traded on, +/- a "0" on the end would also be fine.
						The fundraiser may also end at any time, if sufficient funds have been raised.
					</p>

					{#if isSuccess}
						<b>
							We've exceeded the initial goal, and now are up to {balanceText} satoshis! So about {percentDone}
							&#37; of the initial goal.
						</b>
					{:else}
						<h3>Progress:</h3>
						<LinearProgress progress={balance / goal} />
            <br>
            <h3>💚💚</h3>
						<LinearProgress progress={(balance-goal) / goal} />
						<p>
							So far, {balanceText} satoshis have been raised. About {percentDone} &#37; of the way there.
						</p>
					{/if}
					<p>
						The donation address is a plain pay-to public key hash. If the goal is not met or is
						exceeded, your support will still go towards the project. This is <b>not</b> a flipstarter,
						(Flipstarter is awesome 💚, it's just not the approach for this app).
					</p>
					<p>
						Funding is being sought <i>after</i> the initial app release for three reasons: 1) a lack
						of funding provided invaluable motivation to finish a minimal viable app; 2) it allowed the
						project to be developed in "stealth mode", and, finally, 3) there was zero possibility the
						developer (2qx) could just abscond with all the donations without ever building an app.
					</p>
					<p>
						All donations will be treated as pseudonymous in origin from the previous respective
						unspent outputs. A donation will <b>not</b> confer any stake, interest, privilege or authority
						over the direction of this software. Everything built is free to fork, but is not otherwise
						owned or encumbered.
					</p>
					<p>
						But, as a return on your investment, each donation <b>will receive</b> its own tract in the
						table below, bulleted with tangerine emojis. All donations will be shown until the end campaign,
						at which point all the UTXOs and orange tracts will be rugged.
					</p>
					<Donations {lockingBytecode} />
				</div>
			</Card>
		</div>
	</div>
</section>

<style>
	* :global(.margins) {
		margin: 18px 10px 24px;
	}

	* :global(.columns) {
		display: flex;
		flex-wrap: wrap;
	}

	* :global(.columns > *) {
		flex-basis: 0;
		min-width: 245px;
		margin-right: 12px;
	}
	* :global(.columns > *:last-child) {
		margin-right: 0;
	}

	* :global(.columns .mdc-text-field),
	* :global(.columns .mdc-text-field + .mdc-text-field-helper-line) {
		width: 218px;
	}

	* :global(.columns .status) {
		width: auto;
		word-break: break-all;
		overflow-wrap: break-word;
	}
</style>
