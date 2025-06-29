import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import solidPlugin from "vite-plugin-solid";
import manifest from "./manifest.json";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), // For popup/config pages
    solidPlugin(), // For content scripts
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
        popup: "index.html",
        config: "config.html",
      },
    },
  },
});
