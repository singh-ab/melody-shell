import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    origin: "http://localhost:5000",
    port: 5000,
  },
  base: "http://localhost:5000",
  plugins: [
    react(),
    federation({
      name: "main_app",
      remotes: {
        music_library: {
          type: "module",
          name: "music_library",
          entry: "http://localhost:5001/remoteEntry.js",
        },
      },
      shared: {
        react: {
          singleton: true,
        },
        "react-dom": {
          singleton: true,
        },
      },
    }),
  ],
  build: {
    target: "chrome89",
    modulePreload: false,
    minify: false,
    cssCodeSplit: false,
  },
});
