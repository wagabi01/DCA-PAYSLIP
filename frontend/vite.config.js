import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Change if needed
    open: true,  // Opens browser on start
    cors: true,  // Enables CORS
    proxy: {
      "/api": {
        target: "https://payslip.eliteservices.co.ke", // Change to your backend URL
        changeOrigin: true,
        secure: false, // Set to true if using HTTPS
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist", // Output folder
    assetsDir: "assets", // Assets folder inside dist
    sourcemap: false, // Disable source maps for smaller build
  },
  resolve: {
    alias: {
      "@": "/src", // Allows imports like '@/components/Button'
    },
  },
  base: "/", // Set this if deploying to a subdirectory (e.g., "/subfolder/")
});
