import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src/background",
  build: {
    lib: {
      formats: ["es"],
      entry: "./main.ts"
    },
    outDir: "../../extension/background",
    emptyOutDir: true
  },
  plugins: [],
});
