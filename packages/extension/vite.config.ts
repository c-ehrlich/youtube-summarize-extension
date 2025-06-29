import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import solidPlugin from "vite-plugin-solid";
import manifest from "./manifest.json";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    solidPlugin(), // For all components now
    crx({ manifest })
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
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
