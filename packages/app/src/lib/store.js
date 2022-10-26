import { persist, createLocalStorage } from "@macfja/svelte-persistent-store"
import { writable } from "svelte/store"

export let executorAddress = persist(writable(""), createLocalStorage(true), "executorAddress")

export let protocol = persist(writable("utxo"), createLocalStorage(true), "protocol")

// https://demo.chaingraph.cash/v1/graphql
export let chaingraphHost = persist(writable(""), createLocalStorage(true), "chaingraphHost")
export let node = persist(writable("bchn"), createLocalStorage(true), "node")