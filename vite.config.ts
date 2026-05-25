import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { compression } from "vite-plugin-compression2";
// vitePluginCheckHardcodedColors removed — caused JSX text-node leaks when comments were injected into components

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // vitePluginCheckHardcodedColors() — disabled, was leaking comments as visible JSX text nodes
    react(),
    mode === "development" && componentTagger(),
    // Brotli + gzip pre-compressed assets — Hostinger/Netlify/Vercel serve .br first
    compression({ algorithms: ["brotliCompress"], exclude: [/\.(png|jpg|jpeg|webp|gif|svg|ico)$/] }),
    compression({ algorithms: ["gzip"], exclude: [/\.(png|jpg|jpeg|webp|gif|svg|ico)$/] }),
    process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          org: process.env.SENTRY_ORG ?? "SENTRY_ORG_NOT_SET",
          project: process.env.SENTRY_PROJECT ?? "mwc-booking-lp",
          authToken: process.env.SENTRY_AUTH_TOKEN,
          telemetry: false,
        })
      : null,
  ].filter(Boolean),
  build: {
    sourcemap: false, // disabled for prod — reduces transfer size; re-enable if debugging production errors
    target: "es2022",   // smaller output: native optional chaining, nullish coalescing etc
    minify: "esbuild",
    cssMinify: true,
    chunkSizeWarningLimit: 600,
    // Drop console.log in production only
    esbuildOptions: {
      drop: [],  // keep warns/errors; use define instead
      pure: ["console.log", "console.warn", "console.info"],
      legalComments: "none",
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — always needed
          // Split React core from Router — React core is tiny (7KB), Router adds weight
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["react-router-dom"],
          // Supabase — network heavy, separate chunk
          "vendor-supabase": ["@supabase/supabase-js"],
          // Form + validation
          "vendor-forms": ["zod"],
          // Tiny utilities — always needed, very cheap (<5KB)
          "vendor-utils": ["clsx", "tailwind-merge", "class-variance-authority"],
          // Heavier UI primitives — only loaded when a route that needs them loads
          // Unused Radix packages (react-label, react-separator, react-slot, react-toggle)
          // are kept as dependencies but NOT listed here — Vite tree-shakes them
          // into the specific chunks that import them, rather than preloading eagerly.
          "vendor-ui": [
            // react-dialog removed: only used in lazy booking routes (BookSchedule2, GHLAccordionView)
            // react-tooltip removed: TooltipProvider was unused (no Tooltip components exist in app)
            "@radix-ui/react-toast",
            "lucide-react",
          ],
          // State + query
          "vendor-state": ["zustand", "@tanstack/react-query"],
        },
      },
    },
  },
  // Pre-bundle critical deps to speed up cold starts in dev
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
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
