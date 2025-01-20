import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // TODO: This is a hack to get "hot" reloading to work (by reloading the page lol)
    {
      name: "tailwind-hot",
      enforce: "post",
      handleHotUpdate({ file, server }) {
        if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
          server.ws.send({ type: "full-reload" });
        }
      },
    },
    crx({ manifest }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
    // modules: {
    //   localsConvention: "camelCase",
    // },
  },
  // build: {
  //   rollupOptions: {
  //     input: {
  //       main: "src/main.tsx",
  //       content: "src/content.tsx",
  //     },
  //   },
  // },
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
    hmr: {
      overlay: false,
    },
  },
});
