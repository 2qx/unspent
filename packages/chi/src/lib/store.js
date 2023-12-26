import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';
import { writable } from 'svelte/store';

export let receiptAddressStore = persist(writable(''), createLocalStorage(true), 'receiptAddress');
export let stateStore = persist(writable(''), createLocalStorage(true), 'stateValue');
export let pageStore = persist(writable(''), createLocalStorage(true), 'pageValue');

