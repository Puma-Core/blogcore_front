import { defineConfig } from "vite";

const apiTarget = "https://admin-blog.pumacore.com";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    outDir: process.env.VITE_OUT_DIR || "dist",
  },
  server: {
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});
