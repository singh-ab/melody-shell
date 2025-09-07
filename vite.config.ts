import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5000,
  },
  plugins: [
    react(),
    federation({
      name: "main_app",
      remotes: {
        music_library: {
          type: "module",
          name: "music_library",
          // Use env variable in Vercel or default to localhost for development
          entry: process.env.VITE_MUSIC_LIBRARY_URL
            ? `${process.env.VITE_MUSIC_LIBRARY_URL}/remoteEntry.js`
            : "http://localhost:5001/remoteEntry.js",
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
