import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';
import { writable } from 'svelte/store';

export let receiptAddressStore = persist(writable(''), createLocalStorage(true), 'receiptAddress');
export let walletStore = persist(writable(''), createLocalStorage(true), 'wallet');