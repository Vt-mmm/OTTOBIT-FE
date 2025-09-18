import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Specific aliases following project rules - no @ alias
      components: path.resolve(__dirname, "./src/components"),
      hooks: path.resolve(__dirname, "./src/hooks"),
      sections: path.resolve(__dirname, "./src/sections"),
      store: path.resolve(__dirname, "./src/redux"),
      assets: path.resolve(__dirname, "./src/assets"),
      utils: path.resolve(__dirname, "./src/utils"),
      pages: path.resolve(__dirname, "./src/pages"),
      layout: path.resolve(__dirname, "./src/layout"),
      types: path.resolve(__dirname, "./src/types"),
      common: path.resolve(__dirname, "./src/common"),
      constants: path.resolve(__dirname, "./src/constants"),
      routes: path.resolve(__dirname, "./src/routes"),
      theme: path.resolve(__dirname, "./src/theme"),
      axiosClient: path.resolve(__dirname, "./src/axiosClient"),
    },
  },
  server: {
    host: "localhost", // Only show localhost
    port: 5173,
    strictPort: true,
    open: false,
    proxy: {
      "/api": {
        target: "https://localhost:7093",
        changeOrigin: true,
        secure: false, // Tắt SSL verification cho development
        rewrite: (path) => path,
      },
      "/api/ai-proxy": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path,
      },
      "/detect": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
    // Cải thiện CORS configuration cho security
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://tellme.vercel.app",
        "https://your-production-domain.com",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    },
  },
  define: {
    // Add a polyfill for __dirname
    __dirname: JSON.stringify(""),
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Tắt sourcemap trong production để security
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom", "@mui/material"],
        },
        // Ensure proper chunking and file naming
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
    // Security improvements for build
    minify: "terser",
    terserOptions: {
      compress: {
        // Conditional console removal - keep debug logs in production for now
        drop_console: process.env.NODE_ENV === 'production' ? false : false, // Keep console logs for debugging
        drop_debugger: true, // Remove debugger statements
        // Only remove console.log that don't have debug prefixes
        pure_funcs: process.env.NODE_ENV === 'production' ? [] : [],
      },
    },
  },
  publicDir: "public",
  base: "/", // Sử dụng "/" thay vì "./"
});
