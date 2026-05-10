import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Proxy API calls to the backend server running on port 5000
      '/api': {
        target: 'https://real-time-expert-session-booking-system-mlsz.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      // Proxy socket.io websocket connections
      '/socket.io': {
        target: 'https://real-time-expert-session-booking-system-mlsz.onrender.com',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
