import { writable } from 'svelte/store';

// export interface Loader {
// 	load: () => Promise<void>;
// }

//export const loaderStore = writable(undefined);

export async function load(loader) {
	//loaderStore.set(loader);
	setTimeout(
		async () => await loader.load().then(() => {}),
		500 // TODO: HACK to get loading screen to show
	);
}
