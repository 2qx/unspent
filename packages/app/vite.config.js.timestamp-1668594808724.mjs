// vite.config.js
import { sveltekit } from "file:///home/amnesia/projects/unspent/node_modules/@sveltejs/kit/src/exports/vite/index.js";
var config = {
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ["@unspent/phi"]
  },
  build: {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9hbW5lc2lhL3Byb2plY3RzL3Vuc3BlbnQvcGFja2FnZXMvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9hbW5lc2lhL3Byb2plY3RzL3Vuc3BlbnQvcGFja2FnZXMvYXBwL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2FtbmVzaWEvcHJvamVjdHMvdW5zcGVudC9wYWNrYWdlcy9hcHAvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuXG4vKiogQHR5cGUge2ltcG9ydCgndml0ZScpLlVzZXJDb25maWd9ICovXG5jb25zdCBjb25maWcgPSB7XG5cdHBsdWdpbnM6IFtzdmVsdGVraXQoKV0sXG5cdG9wdGltaXplRGVwczoge1xuXHRcdC8vIGxpbmtlZCBtb2R1bGVzIGluIGEgbW9ub3JlcG8gbXVzdCBiZSBleHBsaWNpdGx5IGluY2x1ZGVkXG5cdFx0aW5jbHVkZTogWydAdW5zcGVudC9waGknXVxuXHR9LFxuXHRidWlsZDoge1xuXHRcdGNvbW1vbmpzT3B0aW9uczoge1xuXHRcdFx0dHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUsXG5cdFx0XHQvLyBsaW5rZWQgbW9kdWxlcyBpbiBhIG1vbm9yZXBvIG11c3QgYmUgZXhwbGljaXRseSBpbmNsdWRlZFxuXHRcdFx0aW5jbHVkZTogWy9AdW5zcGVudFxcL3BoaS8sIC9ub2RlX21vZHVsZXMvXVxuXHRcdH0sXG5cdFx0cm9sbHVwT3B0aW9uczoge1xuXHRcdFx0b3V0cHV0OiB7XG5cdFx0XHRcdHNvdXJjZW1hcDogdHJ1ZSxcblx0XHRcdFx0bmFtZTogJ2FwcCcsXG5cdFx0XHRcdGdsb2JhbHM6IHtcblx0XHRcdFx0XHRldmVudHM6ICdFdmVudCcsXG5cdFx0XHRcdFx0dGxzOiAndW5kZWZpbmVkJyxcblx0XHRcdFx0XHRuZXQ6ICd1bmRlZmluZWQnXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRjb250ZXh0OiAnd2luZG93J1xuXHRcdH1cblx0fSxcblx0ZGVmaW5lOiB7XG5cdFx0J3Byb2Nlc3MuZW52JzogcHJvY2Vzcy5lbnZcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVCxTQUFTLGlCQUFpQjtBQUc3VSxJQUFNLFNBQVM7QUFBQSxFQUNkLFNBQVMsQ0FBQyxVQUFVLENBQUM7QUFBQSxFQUNyQixjQUFjO0FBQUEsSUFFYixTQUFTLENBQUMsY0FBYztBQUFBLEVBQ3pCO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixpQkFBaUI7QUFBQSxNQUNoQix5QkFBeUI7QUFBQSxNQUV6QixTQUFTLENBQUMsaUJBQWlCLGNBQWM7QUFBQSxJQUMxQztBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ1IsUUFBUTtBQUFBLFVBQ1IsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFFBQ047QUFBQSxNQUNEO0FBQUEsTUFDQSxTQUFTO0FBQUEsSUFDVjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLGVBQWUsUUFBUTtBQUFBLEVBQ3hCO0FBQ0Q7QUFFQSxJQUFPLHNCQUFROyIsCiAgIm5hbWVzIjogW10KfQo=
