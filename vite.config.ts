import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
// @ts-expect-error - .mjs file, no declaration needed
import { vitePluginCheckBannedWording } from "./scripts/check-banned-wording.mjs";
// @ts-expect-error - .mjs file, no declaration needed
import { vitePluginCheckHardcodedColors } from "./scripts/check-hardcoded-colors.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    vitePluginCheckBannedWording(),
    vitePluginCheckHardcodedColors(),
    react(),
    mode === "development" && componentTagger(),
    process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          org: "REPLACE_WITH_SENTRY_ORG_SLUG",
          project: "mwc-booking-lp",
          authToken: process.env.SENTRY_AUTH_TOKEN,
          telemetry: false,
        })
      : null,
  ].filter(Boolean),
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "./node_modules/react/jsx-dev-runtime"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react-dom/client": path.resolve(__dirname, "./node_modules/react-dom/client"),
    },
  },
}));
