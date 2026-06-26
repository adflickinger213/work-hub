import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// React app build config. The bundle is regenerated from src/ modules by the
// "bundle" script before vite runs (see package.json dev/build scripts), so
// dist/ never needs to be committed.
export default defineConfig({
  plugins: [react()],
});
