import { defineConfig } from "vite";

const apiTarget = "https://admin-blog.pumacore.com";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});
