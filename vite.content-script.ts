import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src/content-script",
  build: {
    lib: {
      formats: ["es"],
      entry: "./eqplus.ts"
    },
    outDir: "../../extension/content-script",
    emptyOutDir: true
  },
  plugins: [],
});
