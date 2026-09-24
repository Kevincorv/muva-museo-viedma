import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "not dead", "chrome >= 40", "android >= 4.4", "safari >= 9", "ios >= 9", "firefox >= 40"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {},
});
