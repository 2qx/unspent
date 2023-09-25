// vite.config.js
import { sveltekit } from "file:///home/amnesia/projects/unspent/packages/app/node_modules/@sveltejs/kit/src/exports/vite/index.js";
var config = {
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ["@unspent/phi"],
    esbuildOptions: {
      target: "esnext",
      supported: {
        bigint: true
      }
    }
  },
  build: {
    target: ["esnext"],
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/@unspent\/phi/, /node_modules/]
    },
    rollupOptions: {
      output: {
        sourcemap: true,
        name: "app",
        globals: {
          events: "Event",
          tls: "undefined",
          net: "undefined"
        }
      },
      context: "window"
    }
  },
  define: {
    "process.env": process.env
  }
};
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9hbW5lc2lhL3Byb2plY3RzL3Vuc3BlbnQvcGFja2FnZXMvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9hbW5lc2lhL3Byb2plY3RzL3Vuc3BlbnQvcGFja2FnZXMvYXBwL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2FtbmVzaWEvcHJvamVjdHMvdW5zcGVudC9wYWNrYWdlcy9hcHAvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuXG4vKiogQHR5cGUge2ltcG9ydCgndml0ZScpLlVzZXJDb25maWd9ICovXG5jb25zdCBjb25maWcgPSB7XG5cdHBsdWdpbnM6IFtzdmVsdGVraXQoKV0sXG4gIG9wdGltaXplRGVwczogeyAvLyBcbiAgICAvLyBsaW5rZWQgbW9kdWxlcyBpbiBhIG1vbm9yZXBvIG11c3QgYmUgZXhwbGljaXRseSBpbmNsdWRlZFxuICAgIGluY2x1ZGU6IFsnQHVuc3BlbnQvcGhpJ10sXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIHRhcmdldDogXCJlc25leHRcIiwgXG4gICAgICBzdXBwb3J0ZWQ6IHsgXG4gICAgICAgIGJpZ2ludDogdHJ1ZSBcbiAgICAgIH0sXG4gICAgfVxuICB9LCBcblx0YnVpbGQ6IHtcbiAgICB0YXJnZXQ6IFtcImVzbmV4dFwiXSwgLy8gZm9yIGJpZ2ludHNcblx0XHRjb21tb25qc09wdGlvbnM6IHtcblx0XHRcdHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlLFxuXHRcdFx0Ly8gbGlua2VkIG1vZHVsZXMgaW4gYSBtb25vcmVwbyBtdXN0IGJlIGV4cGxpY2l0bHkgaW5jbHVkZWRcblx0XHRcdGluY2x1ZGU6IFsvQHVuc3BlbnRcXC9waGkvLCAvbm9kZV9tb2R1bGVzL11cblx0XHR9LFxuXHRcdHJvbGx1cE9wdGlvbnM6IHtcblx0XHRcdG91dHB1dDoge1xuXHRcdFx0XHRzb3VyY2VtYXA6IHRydWUsXG5cdFx0XHRcdG5hbWU6ICdhcHAnLFxuXHRcdFx0XHRnbG9iYWxzOiB7XG5cdFx0XHRcdFx0ZXZlbnRzOiAnRXZlbnQnLFxuXHRcdFx0XHRcdHRsczogJ3VuZGVmaW5lZCcsXG5cdFx0XHRcdFx0bmV0OiAndW5kZWZpbmVkJ1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0Y29udGV4dDogJ3dpbmRvdydcblx0XHR9XG5cdH0sXG5cdGRlZmluZToge1xuXHRcdCdwcm9jZXNzLmVudic6IHByb2Nlc3MuZW52XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZztcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVQsU0FBUyxpQkFBaUI7QUFHN1UsSUFBTSxTQUFTO0FBQUEsRUFDZCxTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUEsRUFDcEIsY0FBYztBQUFBLElBRVosU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUN4QixnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxRQUNULFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNELE9BQU87QUFBQSxJQUNKLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDbkIsaUJBQWlCO0FBQUEsTUFDaEIseUJBQXlCO0FBQUEsTUFFekIsU0FBUyxDQUFDLGlCQUFpQixjQUFjO0FBQUEsSUFDMUM7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNkLFFBQVE7QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE1BQU07QUFBQSxRQUNOLFNBQVM7QUFBQSxVQUNSLFFBQVE7QUFBQSxVQUNSLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxRQUNOO0FBQUEsTUFDRDtBQUFBLE1BQ0EsU0FBUztBQUFBLElBQ1Y7QUFBQSxFQUNEO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxlQUFlLFFBQVE7QUFBQSxFQUN4QjtBQUNEO0FBRUEsSUFBTyxzQkFBUTsiLAogICJuYW1lcyI6IFtdCn0K
