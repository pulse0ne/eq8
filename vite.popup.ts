import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src/popup",
  base: "",
  build: {
    outDir: "../../extension/popup",
    emptyOutDir: true
  },
  plugins: [react()],
});
