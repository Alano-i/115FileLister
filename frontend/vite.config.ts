import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import svgr from "vite-plugin-svgr";
import tailwindcssNesting from "tailwindcss/nesting";
import postcssImport from "postcss-import";

function pathResolve(dir: string) {
  return resolve(process.cwd(), ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
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
          target: process.env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        "/ws": {
          target: "ws://127.0.0.1",
          ws: true,
        },
      },
    },
    build: {
      target: "es2015",
      cssTarget: "chrome80",
      outDir: "dist",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("antd") || id.includes("@ant-design")) return "antd";
            if (id.includes("artplayer")) return "artplayer";
            if (id.includes("hls.js")) return "hls";
            if (id.includes("axios")) return "http";
            return "vendor";
          },
        },
      },
    },
    css: {
      postcss: {
        plugins: [postcssImport, tailwindcssNesting, tailwindcss, autoprefixer],
      },
    },
  };
});
