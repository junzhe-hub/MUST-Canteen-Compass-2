import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Safely replace process.env.API_KEY with the environment variable value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Prevent crash when accessing other process.env properties by providing an empty object fallback
      'process.env': {}
    }
  };
});