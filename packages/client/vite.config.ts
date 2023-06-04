import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";
// import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // To exclude specific polyfills, add them to this list.
      // exclude: [
      //   "fs", // Excludes the polyfill for `fs` and `node:fs`.
      // ],
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],

  server: {
    port: 3000,
    fs: {
      strict: false,
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
        // stream: Stream,
      },
      // Enable esbuild polyfill plugins
      // plugins: [
      //   NodeGlobalsPolyfillPlugin({
      //     buffer: true,
      //   }),
      // ],
    },
  },
});
