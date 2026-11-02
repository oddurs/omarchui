import path from "node:path";
import StylexRsPlugin from "@stylexswc/unplugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;

export default defineConfig({
  plugins: [
    StylexRsPlugin({
      rsOptions: {
        dev: true,
        aliases: { "@/*": [path.join(root, "*")] },
        unstable_moduleResolution: { type: "commonJS" },
      },
    }),
    react(),
  ],
  resolve: { alias: { "@": root } },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    setupFiles: ["tests/setup.ts"],
  },
});
