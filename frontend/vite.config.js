import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({

  plugins: [react()],

  server: {

    proxy: {

      "/cluster-health": {
        target: "http://localhost:8000",
        changeOrigin: true
      },

      "/unhealthy-pods": {
        target: "http://localhost:8000",
        changeOrigin: true
      },

      "/namespace-summary": {
        target: "http://localhost:8000",
        changeOrigin: true
      },

      "/analyze-cluster": {
        target: "http://localhost:8000",
        changeOrigin: true
      }

    }

  }

});
