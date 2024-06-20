import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

function pathResolve(dir: string) {
  return resolve(process.cwd(), ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  root: "./",
  base: "/",
  publicDir: "public",
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /\/@\//,
        replacement: pathResolve("src") + "/",
      },
    ],
  },
  server: {
    host: true,
    port: 3000,
    // open: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8686",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://127.0.0.1:8686",
        ws: true,
      },
    },
  },
  build: {
    target: "es2015",
    cssTarget: "chrome80",
    outDir: "dist",
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
});
