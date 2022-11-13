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
    // This config is needed for Vite. I don't know why.
    // Vite fails with the following error without it:
    // 11:54:09 AM [vite] Internal server error: Cannot find module '/.../smui/package.json' imported from '/.../smui/node_modules/vite/dist/node/chunks/dep-f5552faa.js'
    //   Plugin: vite:css
    //   File: /.../smui/packages/site/src/routes/__layout.svelte?svelte&type=style&lang.css
    //       at viteResolve (/.../smui/node_modules/vite/dist/node/chunks/dep-f5552faa.js:60126:25)
    //       at Function._resolveFilename (/.../smui/node_modules/vite/dist/node/chunks/dep-f5552faa.js:60140:28)
    //       at Function.Module._load (internal/modules/cjs/loader.js:746:27)
    //       at Module.require (internal/modules/cjs/loader.js:974:19)
    //       at require (internal/modules/cjs/helpers.js:93:18)
    //       at Object.search (/.../smui/node_modules/vite/dist/node/chunks/dep-f5552faa.js:12705:33)
    //       at async resolvePostcssConfig (/.../smui/node_modules/vite/dist/node/chunks/dep-f5552faa.js:20506:22)
    //       at async compileCSS (/.../smui/node_modules/vite/dist/node/chunks/dep-f5552faa.js:20329:27)
    //       at async TransformContext.transform (/.../smui/node_modules/vite/dist/node/chunks/dep-f5552faa.js:20015:50)
    //       at async Object.transform (/.../smui/node_modules/vite/dist/node/chunks/dep-f5552faa.js:36985:30)
    postcss: {},
  },
	preprocess: [
		sveltePreprocess({ sourceMap: false, handleMixedImports: true, reportDiagnostics: true }),
		mdsvex({
			extensions: ['.md'],
      rehypePlugins: [rehypeSlug, [toc, {headings: ["h1", "h2"]}]],
			highlight: {
				alias: { cashscript: 'solidity' }
			}
		})
	]
};

export default config;
