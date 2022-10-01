import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world',
		count: 0
	}
});

export default app;