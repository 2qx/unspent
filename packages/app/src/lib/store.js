import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';
import { writable } from 'svelte/store';

export let executorAddress = persist(writable(''), createLocalStorage(true), 'executorAddress');
export let executorChipnetAddress = persist(writable(''), createLocalStorage(true), 'executorChipnetAddress');
export let protocol = persist(writable('utxo'), createLocalStorage(true), 'protocol');

export let chaingraphHost = persist(
  // https://demo.chaingraph.cash/v1/graphql
	writable('https://gql.chaingraph.pat.mn/v1/graphql'),
	createLocalStorage(true),
	'chaingraphHost'
);

export let explorer = persist(
	writable('https://explorer.bitcoinunlimited.info/'),
	createLocalStorage(true),
	'explorer'
);


export let chipnetExplorer = persist(
	writable('https://chipnet.imaginary.cash/'),
	createLocalStorage(true),
	'chipnetExplorer'
);

export let node = persist(writable('mainnet'), createLocalStorage(true), 'node');
