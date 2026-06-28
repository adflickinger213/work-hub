import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// React app build config. The bundle is regenerated from src/ modules by the
// "bundle" script before vite runs (see package.json dev/build scripts), so
// dist/ never needs to be committed.
export default defineConfig({
  plugins: [react()],
  build: {
    // Work Hub ships as one large artifact bundle on purpose (it pastes back
    // into a single Claude.ai artifact), so the default 500 kB chunk advisory
    // doesn't apply. Raise the limit so a clean build emits no warnings.
    chunkSizeWarningLimit: 2000,
  },
});
