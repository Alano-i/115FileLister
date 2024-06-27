import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import svgr from "vite-plugin-svgr";

function pathResolve(dir: string) {
  return resolve(process.cwd(), ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  root: "./",
  base: "/",
  publicDir: "public",
  plugins: [svgr(), react()],
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
        target: "https://file.36d.icu:3636",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://file.36d.icu:3636",
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
