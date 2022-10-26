import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	optimizeDeps: {
		// linked modules in a monorepo must be explicitly included
		include: ['@unspent/phi']
	  },
	build:{
		commonjsOptions:{
				transformMixedEsModules: true,
				// linked modules in a monorepo must be explicitly included
				include: [/@unspent\/phi/, /node_modules/]
		},
		rollupOptions:{
			output: {
				sourcemap: true,
				name: 'app',
				globals: {
					"events":"Event",
					"tls": "undefined",
					"net":"undefined"
				}
			},
			context: 'window'
		}

	},
	define: {
		'process.env': process.env
	  }
};

export default config;
