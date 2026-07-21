import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  envDir: ".",
  envPrefix: ["VITE_", "SUPABASE_"],
  plugins: [
    react({
      babel: {
        compact: false,
        presets: [
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript",
        ],
      },
    }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Veytrix.Ai",
        short_name: "Veytrix",
        description: "AI Video Editor",
        theme_color: "#0a0a0a",
        icons: [],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "./src/app/components"),
      "@/context": path.resolve(__dirname, "./src/app/context"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        proxyTimeout: 600000, // 10 minutes for large video file uploads
        timeout: 600000,      // 10 minutes
      },
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
