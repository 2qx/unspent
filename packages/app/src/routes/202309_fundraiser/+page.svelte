<script>
	import { beforeUpdate } from 'svelte';
	import { assets } from '$app/paths';
	import { base } from '$app/paths';
	import { load } from '$lib/machinery/loader-store.js';
	import LinearProgress from '@smui/linear-progress';
	import Card from '@smui/card';
	import { Confetti } from 'svelte-confetti';
	import { deriveLockingBytecodeHex, getDefaultElectrumProvider } from '@unspent/phi';

	import Address from '$lib/Address.svelte';
	import Donations from '$lib/Donations.svelte';
	import AddressQrCode from '$lib/AddressQrCode.svelte';

	const cashaddr = 'bitcoincash:qz7xjt4xcpdu2gl75vrvkpwzfpjhy9hnm55gwzyvj4';
	let lockingBytecode = deriveLockingBytecodeHex(cashaddr);

	const perp = 'bitcoincash:pdmv95esl9sjzyp9h5rkqz24zr0kp4xxmttc037yc7wn84gtulx7x086f66qx';
	const perpLockingBytecode =
		'aa2076c2d330f961211025bd0760095510df60d4c6dad787c7c4c79d33d50be7cde387';

	let goal = 5000000000n;
	let goalText = goal.toLocaleString();
	let balance = 0n;
	let perpBalance = 0n;
	let balanceText = '';
  let p2pkhBCHText = "";
	let perpBalanceText = '';
  let p2shBCHText = "";

	let percentDone = '';
	let perpPercentDone = '';
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
        p2pkhBCHText = (balance/100000000n).toLocaleString()
				percentDone = Number((balance / goal) * 100n).toFixed(4);
				isSuccess = balance > goal ? true : false;

				if (cashaddr) perpBalance = await getBalance(perp);
				perpBalanceText = perpBalance.toLocaleString();
				p2shBCHText = (perpBalance/100000000n).toLocaleString();
				perpPercentDone = Number((perpBalance / goal) * 100n).toFixed(4);
				isSuccess = balance > goal ? true : false;
			}
		});
	};

	const getBalance = async (cashaddr) => {
		let e = getDefaultElectrumProvider();

		let utxos = await e.getUtxos(cashaddr);
		let balance = utxos
			.map((o) => {
				return o.satoshis;
			})
			.reduce((a, b) => a + b, 0n);
		return balance;
	};
</script>

<svelte:head>
	{#if isSuccess}
		<title>💚 ₿∙ϕ 🎉 🥳</title>
	{:else}
		<title>₿∙ϕ ◼️ ⛏️</title>
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
			colorArray={['#000', '#111']}
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
					<h1>Welcome! to the Final-Forever Unspent Fundraiser!</h1>

					<table>
						<tr>
							<td>
								<img src="{assets}/images/pickers.jpeg" alt="Slate pickers" />
							</td>
						</tr>
						<caption style="caption-side: bottom;">
							This here's a broken child coal miner themed fundraiser. ◼️ ⛏️ 🧒🏼
						</caption>
					</table>

					<h2>Welcome, Welcome, Welcome! This is it!</h2>
					<p>
						Back in May of 2022, this project began under the name <a
							href="https://www.npmjs.com/package/bitcoin-cash-forever"
							target="_blank">bitcoin-cash-forever</a
						>, with the goal of creating a financial instrument that could shepherd wealth forward
						in time. Now on the third iteration, the simple irrevocable perpetuity contract
						<b> may be good enough to begin handling a modest amount of user wealth.</b>
					</p>
					<p>
						For many users, a hard contract may be a safer way to protect part of their long-term
						investment, as opposed to storing all funds in a liquid wallet they control. It's
						somewhat easy to spend the most hyper-liquid asset in the history of finance. Passing
						custody of some funds to a time locked contract may be a better way for many users to
						realize the full potential of their investment over a longer period of time.
					</p>

					<table>
						<tr>
							<td>
								<img src="{assets}/dev/survivor.png" alt="survivor" />
							</td>
						</tr>
						<caption style="caption-side: bottom;">unspent transaction output bias is real.</caption
						>
					</table>

					<p>
						Part of the motivation wasn't technical or monetary, but rather the friends we lost
						along the way. The idea of bitcoin has been abandoned by so many cool and weird people.
						It's easy to print money, but the idea and hope for a freer future was the real wealth
						in the social construct―and is harder to get back.
					</p>

					<p>
						Anyway, if all calculations are correct, this should be the last fundraiser needed for
						this software. If this all works, no need for future fundraising is anticipated.
					</p>

					<p>This is the last chance to participate in a fundraiser related to this project.</p>

					<h2>Update since the last raise, 2023 to date</h2>

					<p>
						With the <a target="_blank" href="/202212_fundraiser"
							>generous support of about 5,673,386,488 sats in December 2022</a
						>, below is a very broad summary of enhancements to the core library, app and cli this
						year.
					</p>
					<p>
						The funds raised allowed for about nine months of real-world app and contract testing
						with a not insignificant amount of money.
					</p>

					<h3>Unspent Phi Version 2 is live!</h3>
					<p>
						New Unspent Phi contracts are available with improved security, better edge behavior and
						better penultimate transaction logic.
					</p>
					<ul>
						<li>
							All contracts have been redesigned and tested to allow spending every last satoshi.
						</li>
						<li>Contracts now use p2sh32 addresses by default for enhanced security.</li>
						<li>All contracts enforce one input per transaction.</li>
						<li>
							One input per tx prevents a potential <a href="{base}/202308_security" target="_blank"
								>exploit</a
							> that could have resulted in loss of funds.
						</li>
						<li>The transaction version is now enforced for all contracts.</li>
						<li>
							Of course, legacy contracts are still supported by the <a
								href="https://www.npmjs.com/package/@unspent/phi"
								target="_blank">@unspent/phi</a
							> wrapper package.
						</li>
					</ul>

					<h3>Upgrades to unspent.app</h3>
					<p>
						A number of features were added to the little web app for creating, tracking and
						executing contracts.
					</p>
					<ul>
						<li>Fancy QR codes.</li>
						<li>Schedule charts for annuities and perpetuities.</li>
						<li>Added a caching network provider that uses IndexedDB, if available.</li>
						<li>Added app support for early prototype contracts (v0).</li>
						<li>[WIP] Links to BitAuth IDE [Alpha].</li>
					</ul>
					<h3>Upgrades to the command line interface</h3>
					<p>Some basic chores were completed for command line tooling.</p>
					<ul>
						<li>Automated deployment.</li>
						<li>Better test coverage.</li>
					</ul>

					<h3>Fun stuff too</h3>
					<p>
						About two thirds of the December fundraiser money went literally into the app for
						testing. Including:
					</p>
					<ul>
						<li>Created random faucets with all sorts of parameters.</li>
						<li>Funds supported individuals in the ecosystem in novel ways.</li>
						<li>Engaged a very small group of users and bots to effectuate transactions.</li>
						<li>Became aware of a latent bug using a zero timelock faucet!</li>
					</ul>

					<h3>Thanks to all the testers!</h3>
					<p>
						An app is nothing without users. There appears to be a great mix of users given usage
						and traffic by country.
					</p>
					<ul>
						<li>Shout out to the users who wrote bots!</li>
						<li>Thank you Mozambique for consistent engagement!</li>
						<li>Recognition for Taiwan's puzzlingly high web traffic.</li>
						<li>Shout out to the current reigning zero-timelock faucet hack-a-thon champ!</li>
						<li>Everyone who stopped in to check things out. Thank you!</li>
					</ul>

					<h2>The Pitch</h2>

					<p>
						Currently the software is mostly feature complete. There's no promise of returns or
						future benefits from supporting the work that's done.
					</p>

					<p>
						While bug fixes and maintenance will be done, the funds raised are actually going to
						support a completely new and different project in the Bitcoin Cash space―for which the
						odds of success look so bad, most people lost hope of winning half a decade ago.
					</p>

					<p>There's two ways to support this type of work: now or forever.</p>
					<p>
						The first address is a plain pay-to-public-key hash address. The second address is the
						latest monthly perpetuity (with default settings) paying to the former address over the
						next few decades.
					</p>
					<p>
						If the second fundraiser goal is met, it will more than double the TLV secured by this
						protocol. However, the `cash` in the first goal is also somewhat seriously needed
						urgently as well.
					</p>
					{#if cashaddr}
						<table>
							<tr>
								<td>
									<img src="{assets}/dev/side_meme.png" alt="side" />
								</td>
							</tr>
							<caption style="caption-side: bottom;">Pick a side, cash or code.</caption>
						</table>
						<div
							style="display: flex; flex-wrap:wrap; align-items: center; justify-content: center;"
						>
							<div style="padding: 10px">
								<table style="width:auto">
									<tr>
										<td>
											<AddressQrCode size={225} codeValue={cashaddr} {lockingBytecode} />
											 {p2pkhBCHText} <b>BCH 💚</b> <LinearProgress progress={Number(balance) / Number(goal)} />
										</td>
									</tr>
									<tr>
										<td style="text-align: center;"> Cash is king! </td>
									</tr>
									<tr>
										<td style="width: 220px"><Address address={cashaddr} /></td>
									</tr>
								</table>
							</div>
							<div style="padding: 10px">
								<table style="width:auto">
									<tr>
										<td>
											<AddressQrCode
												size={225}
												codeValue={perp}
												lockingBytecode={perpLockingBytecode}
											/>
											{ p2shBCHText } <b>BCH 💚</b> <LinearProgress progress={Number(perpBalance) / Number(goal)} />
										</td>
									</tr>
									<tr>
										<td style="text-align: center;"> Pay to the script. </td>
									</tr>
									<tr>
										<td style="width: 220px"><Address address={perp} /></td>
									</tr>
								</table>
							</div>
						</div>
					{/if}

					<p>
						The goal is to raise 100 BCH in total; 50 BCH in 'cash' and 50 BCH locked in the
						protocol, for later. Of course, given the nature of the markets Bitcoin Cash is traded
						on, +/- a "0" on the end would also be fine. The fundraiser may also end at any time, if
						sufficient funds have been raised.
					</p>

					{#if isSuccess}
						<b>
							We've exceeded the initial goal, and now are up to {balanceText} satoshis! So about {percentDone}
							&#37; of the initial goal.
						</b>
					{:else}
						<h3>Progress:</h3>
						<p>
							So far, {balanceText} satoshis have been raised in cash and {perpBalanceText} has been
							locked for later distribution.
						</p>
					{/if}

					<p>
						All donations will be treated as pseudonymous in origin from the previous respective
						unspent outputs. A donation will <b>not</b> confer any stake, interest, privilege or authority
						over the direction of this software. Everything built is free to fork, but is not otherwise
						owned or encumbered.
					</p>
					<div id="description">"It is a great principle." - John D. Rockefeller, Jr.</div>
					<p>
						But, as a return on your investment, each donation <b>will receive</b> its own box in the
						table below, bulleted with a lump of coal. All donations will be shown until the end of the
						campaign, at which point the money is whisked away for safe keeping and the little episode
						will be covered over.
					</p>
					<div style="display: flex; flex-wrap:wrap; align-items: center; justify-content: center;">
						<div style="max-width:285px; padding: 10px;">
							<Donations {lockingBytecode} />
						</div>
						<div style="max-width:285px; padding: 10px;">
							<Donations lockingBytecode={'aa2076c2d330f961211025bd0760095510df60d4c6dad787'} />
						</div>
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

	#description {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 5px;
		width: 100%;
		max-width: 44rem;
		margin: 0 auto;
		box-sizing: border-box;
		text-align: center;
		background-color: #fff;
		border: 3px solid #f0f;
	}
</style>
