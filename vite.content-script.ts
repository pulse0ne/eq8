import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src/content-script",
  build: {
    lib: {
      formats: ["iife"],
      name: "contentScript",
      entry: "./eqplus.ts"
    },
    outDir: "../../extension/content-script",
    emptyOutDir: true
  },
  plugins: [],
});
