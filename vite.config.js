import { defineConfig } from "vite";

const apiTarget = "https://admin-blog.pumacore.com";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
});
