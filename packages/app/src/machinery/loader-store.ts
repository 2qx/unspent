import { writable } from 'svelte/store';

export interface Loader {
  load: () => Promise<void>;
}

export const loaderStore = writable<Loader | undefined>(undefined);

export async function load(loader: Loader) {
  loaderStore.set(loader);
  setTimeout(
    async () =>
      await loader
        .load()
        .then(() => loaderStore.set(undefined))
        ,
    500 // TODO: HACK to get loading screen to show
  );
}