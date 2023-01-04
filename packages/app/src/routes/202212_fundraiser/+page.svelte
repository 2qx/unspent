<script>
	import { beforeUpdate } from 'svelte';
	import { assets } from '$app/paths';
	import { load } from '$lib/machinery/loader-store.js';
	import LinearProgress from '@smui/linear-progress';
	import Card from '@smui/card';
	import { Confetti } from 'svelte-confetti';
	import { deriveLockingBytecodeHex } from '@unspent/phi';

	import Donations from '$lib/Donations.svelte';
	import AddressQrCode from '$lib/AddressQrCode.svelte';

	let goal = 6400000000;
	let raised = 5673386488;
	let goalText = goal.toLocaleString();
	let balance = 0;
	let balanceText = '';
	let percentDone = '';
	let isSuccess = false;

	let response = [
		{
			output_index: 2,
			transaction_hash: '\\x9f1493365fb90cbb6c75f209fc2a4745e5b5a191b76050d650ba95b0fd26dff7',
			value_satoshis: 651
		},
		{
			output_index: 4,
			transaction_hash: '\\x4c85386d7e9f1b66444ab90b954ba08f8027e0a7b726694f1673afeae7c50727',
			value_satoshis: 638
		},
		{
			output_index: 4,
			transaction_hash: '\\x5e645872debca4803de10114c47b73d3d48cef4bf35088dea3b493b0d14a1831',
			value_satoshis: 825
		},
		{
			output_index: 0,
			transaction_hash: '\\xb4e07159b409954a1c2439511c3c6e4c96516ebf3e2700ebab8a5138b0779a12',
			value_satoshis: 4910968
		},
		{
			output_index: 2,
			transaction_hash: '\\xfbb97fef496e81529e2112e59fec5f5096b221b0b6c3756a98f4aaab18d2c249',
			value_satoshis: 651
		},
		{
			output_index: 4,
			transaction_hash: '\\xf8d7c29454856dc1f3f80149162d6f45ad8abd1b2fe83eee5ded77ab89073482',
			value_satoshis: 825
		},
		{
			output_index: 4,
			transaction_hash: '\\x99ed4fea7241feb878e067883f917f364f9699f454258794b77255035bbd5e27',
			value_satoshis: 825
		},
		{
			output_index: 4,
			transaction_hash: '\\x73955c9ca14e2fccc880ca34fcf30a50adee140c7f8b7518fbfd5f315772c7ce',
			value_satoshis: 825
		},
		{
			output_index: 2,
			transaction_hash: '\\x0682cc656eb5a759037107a10f07d405aae7de735c4c96d84d9af5c1066b8c62',
			value_satoshis: 975
		},
		{
			output_index: 4,
			transaction_hash: '\\x63834eb8baa0cf23e50d3b7b2d46a75ec6518030764d9d1165edc2e48f05fa53',
			value_satoshis: 825
		},
		{
			output_index: 4,
			transaction_hash: '\\xf33523d05edb25222817519244db799cf24c78070c5c3065804e8f9cc46c3918',
			value_satoshis: 825
		},
		{
			output_index: 4,
			transaction_hash: '\\xa3c69b24a2dd2633422d823ad45d35e394f9c64e3021d4a4d9a35c5fc370f2fd',
			value_satoshis: 825
		},
		{
			output_index: 4,
			transaction_hash: '\\x593d677b1658dea9311f36265a3d35f3fdafff17a59887e4f6d75046292f6d23',
			value_satoshis: 825
		},
		{
			output_index: 1,
			transaction_hash: '\\xb903923dcadf05a9b5bc87e691d421ebb25e6ce8ff4e6bf923b25cffac0ccfb4',
			value_satoshis: 10000000
		},
		{
			output_index: 0,
			transaction_hash: '\\x89fc9f028a3bd143123a808a25c1148ea9cbc111decf72b443f9ebba12a44f5f',
			value_satoshis: 100000
		},
		{
			output_index: 1,
			transaction_hash: '\\x54801394e33ab3a96c26f49b28592c27a1489b02b6f096fbfa131f6a2360ba99',
			value_satoshis: 1000000000
		},
		{
			output_index: 0,
			transaction_hash: '\\xdd92df8c8a9108097776e4f9adabaff4ad40e03c4347709dca0ff9ad0d91c08e',
			value_satoshis: 12484433
		},
		{
			output_index: 0,
			transaction_hash: '\\x53dd199c887dc8b1b96cbeb2bda3f481414452427712fee16c3637707672ff3e',
			value_satoshis: 90539586
		},
		{
			output_index: 1,
			transaction_hash: '\\xc13c48b6df672dbf86cf7b39926884c5f8c4d536502d43d96c9e99636fe80004',
			value_satoshis: 2208724461
		},
		{
			output_index: 0,
			transaction_hash: '\\x4c1d82207af33f1b597f4d553831f46cf77660582bca41e8a03a6564b3c0b8f7',
			value_satoshis: 1814300
		},
		{
			output_index: 4,
			transaction_hash: '\\x2d977ba5f16e4a0eec3177617f9d7e06a2fc14da10f028e0093f5a00ac0726b9',
			value_satoshis: 825
		},
		{
			output_index: 0,
			transaction_hash: '\\x8a1809d5f7386d83877132397e208504045b0e56f133554d1b2141ae2e255102',
			value_satoshis: 44873233
		},
		{
			output_index: 1,
			transaction_hash: '\\x2cbd6481a9e2e8d5f62c53ad94842be1f955d90bd8f4cb2e1242762ca20a5fbe',
			value_satoshis: 50000000
		},
		{
			output_index: 0,
			transaction_hash: '\\xd9eb0d73a34732669a76f500a8f39fb4b2caf843e5de5d910c3d977ce09fe0ab',
			value_satoshis: 60000
		},
		{
			output_index: 0,
			transaction_hash: '\\x553297e591186c249da343cd5ede711103c65b3ae51ae23dfbd3adab2cf20963',
			value_satoshis: 45350
		},
		{
			output_index: 0,
			transaction_hash: '\\x1a68ff835db7bc1f8da869e129e9b27e65212c58019a9137007f91a98726b02a',
			value_satoshis: 101234
		},
		{
			output_index: 1,
			transaction_hash: '\\x7c963cc6e05ec3637df3582b576d2be13ca698378998e39c3ee148683fde996b',
			value_satoshis: 100000000
		},
		{
			output_index: 1,
			transaction_hash: '\\x8949fb7b1bcca8dccc59ed59a0f38be0a4cc167123af528d14a20e90eebe05f7',
			value_satoshis: 1000000000
		},
		{
			output_index: 0,
			transaction_hash: '\\x30dcafde7a9eaa6302c01696a1cd39a5b35b936d3bf41d725477f7af952866eb',
			value_satoshis: 15714698
		},
		{
			output_index: 1,
			transaction_hash: '\\xe7d7af54b5bf0721d99df0dfb3bd0b9d9d6ce53331a5d48c4a8f40af77794136',
			value_satoshis: 1000000000
		},
		{
			output_index: 1,
			transaction_hash: '\\x18750c2bb451e7d7db5e81dc25e81531ecad93eacf95fbe89e06760bcf5a2dcf',
			value_satoshis: 133700000
		},
		{
			output_index: 0,
			transaction_hash: '\\xdec0fc668287fe1d0ee5c651b8884e1fa130df5a30a2257f566cdcbbce3bd3be',
			value_satoshis: 274032
		},
		{
			output_index: 1,
			transaction_hash: '\\xb2b6574f56dc787c0996630d6d64c17e6c56a6c560a1377ce109a4ec4f7223ef',
			value_satoshis: 11831
		},
		{
			output_index: 2,
			transaction_hash: '\\xb6e39769c600ec0e87f7a2128eadc8037adb58aa887d7de52101042f1ef3f2cf',
			value_satoshis: 759
		},
		{
			output_index: 1,
			transaction_hash: '\\xa22d47b366988f163d60fcea75d8bed5ed509385c04ff367bbd5ed8814d22758',
			value_satoshis: 668
		},
		{
			output_index: 2,
			transaction_hash: '\\xa282e50f425b4e8b2e3036bb85c02da8de8c8db431f7bfb96f6ed9631f5b1ecd',
			value_satoshis: 975
		},
		{
			output_index: 1,
			transaction_hash: '\\x30726ead0b3ff5aeaf4a92fb12489c54297bd4e8470f8806ed29609e45f9d60a',
			value_satoshis: 668
		},
		{
			output_index: 1,
			transaction_hash: '\\xc472b2b23916bcbb091d318d03a15c11bd97ca8c5355a5bf65747ca303c73d7f',
			value_satoshis: 586
		},
		{
			output_index: 1,
			transaction_hash: '\\x0b0b30a2b52476b9145e188ba87db8e599033b9b8b4b0572cbf806ea1356b36a',
			value_satoshis: 832
		},
		{
			output_index: 1,
			transaction_hash: '\\x3be50168f6b7c5909e8d4414d191d469858111cd309045ddb252080a94f10a57',
			value_satoshis: 668
		},
		{
			output_index: 1,
			transaction_hash: '\\x57ec536abc6451d52b3eea7b29fad9d0fc44920788e3a5385ef47b6d6da77a0e',
			value_satoshis: 586
		},
		{
			output_index: 1,
			transaction_hash: '\\xefe55b67b66cbca7460c6622593994d92a3db2df8646d49273f757de5326bcb4',
			value_satoshis: 586
		},
		{
			output_index: 1,
			transaction_hash: '\\x9c7284884fcfef238dbbbe4554dd730d8d640934169ddb3b95429626c9167ba2',
			value_satoshis: 586
		},
		{
			output_index: 1,
			transaction_hash: '\\xf2c363036830bc6e1af2d19af6672de65bda983058a3a5dc6662144a1d28e6ad',
			value_satoshis: 586
		},
		{
			output_index: 1,
			transaction_hash: '\\xc04f489466342b26a517e6a7e1e41094e1266edb7b1d47ecb9962978bea113d3',
			value_satoshis: 668
		},
		{
			output_index: 1,
			transaction_hash: '\\xecda058efec50bf5ec760f6ee03edc1e282b41da37203abcb5f22a2f531c7589',
			value_satoshis: 668
		},
		{
			output_index: 2,
			transaction_hash: '\\x6e2c9e3d045608503aa447674e0362ff54a0236c306b951b023dc54004432a3d',
			value_satoshis: 11775
		},
		{
			output_index: 4,
			transaction_hash: '\\x438eef56a488adfaf39998ff17ebb15a044179a59fc338081f841263c973c658',
			value_satoshis: 825
		},
		{
			output_index: 1,
			transaction_hash: '\\x51f335a5647a62ccd521fd3657132a212be4d0f0ef1c6601d336872bd43919df',
			value_satoshis: 586
		}
	];
	beforeUpdate(async () => {
		if (!balance) await updateBalance();
	});

	const updateBalance = async () => {
		await load({
			load: async () => {
				balance = getBalance();
				balanceText = balance.toLocaleString();
				percentDone = ((balance / goal) * 100).toFixed(4);
				isSuccess = balance > 5673386487 ? true : false;
			}
		});
	};

	const getBalance = () => {
		return raised;
	};
</script>

<svelte:head>
	<title>💚 ₿∙ϕ 🎉 🥳</title>
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
z-index: 289;
pointer-events: none;"
	>
		<Confetti
			x={[-5, 5]}
			y={[0, 0.1]}
			delay={[500, 5000]}
			colorArray={['#0F0', '#F0F']}
			duration="10000"
			amount="800"
			fallDistance="140vh"
		/>
	</div>
{/if}

<section>
	<div class="card-display">
		<div class="card-container">
			<Card class="demo-spaced">
				<div class="margins">
					<h1>The Unspent Phi Inaugural Fundraising Campaign has concluded!</h1>

					<table>
						<tr>
							<td>
								<img src="{assets}/dev/stereoscopic.png" alt="Orange Grove" />
							</td>
						</tr>
						<caption style="caption-side: bottom;"
							>Howdy Do, Partner?! This here was a tangerine n' cowboy themed fundraiser. 🤠 🍊
						</caption>
					</table>

					<p>
						This fundraiser was to support the further development of an open-source ecosystem
						around anyone-can-spend utxo contracts. A fraction of money donated was <i>also</i> forwarded
						to support the software and tools this app depends on. At present, the app uses generic backend
						infrastructure (fulcrum/chaingraph), but some of the budget was be set aside to run dedicated
						deployments of those generic services.
					</p>

					{#if isSuccess}
						<p>
							The goal was to raise at least {goalText} satoshis (64 BCH) by the end of 2022. However,
							{raised.toLocaleString()} is plenty.
						</p>
					{/if}
					<p>The donation address was a plain pay-to public key hash.</p>
					<p>
						Funding was sought <i>after</i> the initial app release for three reasons: 1) a lack of funding
						provided invaluable motivation to finish a minimal viable app; 2) it allowed the project
						to be developed in "stealth mode", and, finally, 3) there was zero possibility the developer
						(2qx) could just abscond with all the donations without ever building an app.
					</p>
					<p>
						All donations were treated as pseudonymous in origin from the previous respective
						unspent outputs. A donation did <b>not</b> confer any stake, interest, privilege or authority
						over the direction of this software. Everything built is free to fork, but is not otherwise
						owned or encumbered.
					</p>
					<p>
						But, as a return on the investment, each donation <b>received</b> its own tract in the table
						below, bulleted with tangerine emojis. The actual unspent utxos have moved on to bigger and
						better endeavors. The tracts are like their own non fungible tokens, except the unspent output
						is then spent and repurposed.
					</p>
					<Donations {response} />
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
