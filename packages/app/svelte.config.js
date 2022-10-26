import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex'
import sveltePreprocess from 'svelte-preprocess'

const dev = process.env.NODE_ENV === 'development';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
            pages: "../../docs",
            assets: "../../docs"
        }),

		appDir: 'a',
	},
	extensions: ['.svelte', '.md'],

	preprocess: [
	  sveltePreprocess({ sourceMap: false,
		handleMixedImports:true,
		reportDiagnostics: true
	 }),
	  mdsvex({
		extensions: ['.md'],
		highlight: {
			alias: { cashscript: "solidity" }
		}
	  })
	]
};

export default config;
