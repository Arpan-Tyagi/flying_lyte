import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    allowedHosts: ["tour-olympic-strategy-exploring.trycloudflare.com"],
  },

  build: {
    target: "es2015",
    cssTarget: "chrome61",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          icons: ["lucide-react"],
        },
      },
    },
  },

  esbuild: {
    target: "es2015",
  },

  optimizeDeps: {
    esbuildOptions: {
      target: "es2015",
    },
  },
});
