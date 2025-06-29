import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import solidPlugin from "vite-plugin-solid";
import manifest from "./manifest.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    solidPlugin(), // For all components now
    crx({ manifest })
  ],
  css: {
    modules: {
      // Enable CSS modules for .module.css files
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: "popup.html",
        main: "index.html",
        config: "config.html",
      },
    },
  },
});
