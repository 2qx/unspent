import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import toc from '@jsdevtools/rehype-toc';
import rehypeSlug from 'rehype-slug';
import sveltePreprocess from 'svelte-preprocess';

const dev = process.env.NODE_ENV === 'development';
/** @type {import('@sveltejs/kit').Config} */
const config = {
  ssr: {
    noExternal: [/^@material\//],
  },
	kit: {
		adapter: adapter({
			pages: '../../docs',
			assets: '../../docs'
		}),
		paths: {
			// change below to your repo name
			base: dev ? '' : ''
		}
	},
	extensions: ['.svelte', '.md'],
  css: {
   postcss: {},
  },
	preprocess: [
		sveltePreprocess({ sourceMap: false, handleMixedImports: true, reportDiagnostics: true }),
		mdsvex({
      layout: {
        splash: "./src/routes/splash.svelte"
      },
			extensions: ['.md'],
      rehypePlugins: [rehypeSlug, [toc, {headings: ["h1", "h2"]}]],
			highlight: {
				alias: { cashscript: 'solidity' }
			}
		})
	]
};

export default config;
