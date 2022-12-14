// vite.config.js
import { sveltekit } from 'file:///home/amnesia/projects/unspent/node_modules/@sveltejs/kit/src/exports/vite/index.js';
var config = {
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['@unspent/phi']
	},
	build: {
		commonjsOptions: {
			transformMixedEsModules: true,
			include: [/@unspent\/phi/, /node_modules/]
		},
		rollupOptions: {
			output: {
				sourcemap: true,
				name: 'app',
				globals: {
					events: 'Event',
					tls: 'undefined',
					net: 'undefined'
				}
			},
			context: 'window'
		}
	},
	define: {
		'process.env': process.env
	}
};
var vite_config_default = config;
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9hbW5lc2lhL3Byb2plY3RzL3Vuc3BlbnQvcGFja2FnZXMvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9hbW5lc2lhL3Byb2plY3RzL3Vuc3BlbnQvcGFja2FnZXMvYXBwL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2FtbmVzaWEvcHJvamVjdHMvdW5zcGVudC9wYWNrYWdlcy9hcHAvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuXG4vKiogQHR5cGUge2ltcG9ydCgndml0ZScpLlVzZXJDb25maWd9ICovXG5jb25zdCBjb25maWcgPSB7XG5cdHBsdWdpbnM6IFtzdmVsdGVraXQoKV0sXG5cdG9wdGltaXplRGVwczoge1xuXHRcdC8vIGxpbmtlZCBtb2R1bGVzIGluIGEgbW9ub3JlcG8gbXVzdCBiZSBleHBsaWNpdGx5IGluY2x1ZGVkXG5cdFx0aW5jbHVkZTogWydAdW5zcGVudC9waGknXVxuXHQgIH0sXG5cdGJ1aWxkOntcblx0XHRjb21tb25qc09wdGlvbnM6e1xuXHRcdFx0XHR0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcblx0XHRcdFx0Ly8gbGlua2VkIG1vZHVsZXMgaW4gYSBtb25vcmVwbyBtdXN0IGJlIGV4cGxpY2l0bHkgaW5jbHVkZWRcblx0XHRcdFx0aW5jbHVkZTogWy9AdW5zcGVudFxcL3BoaS8sIC9ub2RlX21vZHVsZXMvXVxuXHRcdH0sXG5cdFx0cm9sbHVwT3B0aW9uczp7XG5cdFx0XHRvdXRwdXQ6IHtcblx0XHRcdFx0c291cmNlbWFwOiB0cnVlLFxuXHRcdFx0XHRuYW1lOiAnYXBwJyxcblx0XHRcdFx0Z2xvYmFsczoge1xuXHRcdFx0XHRcdFwiZXZlbnRzXCI6XCJFdmVudFwiLFxuXHRcdFx0XHRcdFwidGxzXCI6IFwidW5kZWZpbmVkXCIsXG5cdFx0XHRcdFx0XCJuZXRcIjpcInVuZGVmaW5lZFwiXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRjb250ZXh0OiAnd2luZG93J1xuXHRcdH1cblxuXHR9LFxuXHRkZWZpbmU6IHtcblx0XHQncHJvY2Vzcy5lbnYnOiBwcm9jZXNzLmVudlxuXHQgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVQsU0FBUyxpQkFBaUI7QUFHN1UsSUFBTSxTQUFTO0FBQUEsRUFDZCxTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUEsRUFDckIsY0FBYztBQUFBLElBRWIsU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUN2QjtBQUFBLEVBQ0YsT0FBTTtBQUFBLElBQ0wsaUJBQWdCO0FBQUEsTUFDZCx5QkFBeUI7QUFBQSxNQUV6QixTQUFTLENBQUMsaUJBQWlCLGNBQWM7QUFBQSxJQUMzQztBQUFBLElBQ0EsZUFBYztBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ1IsVUFBUztBQUFBLFVBQ1QsT0FBTztBQUFBLFVBQ1AsT0FBTTtBQUFBLFFBQ1A7QUFBQSxNQUNEO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDVjtBQUFBLEVBRUQ7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLGVBQWUsUUFBUTtBQUFBLEVBQ3RCO0FBQ0g7QUFFQSxJQUFPLHNCQUFROyIsCiAgIm5hbWVzIjogW10KfQo=
