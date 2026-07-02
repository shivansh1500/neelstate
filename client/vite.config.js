import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          secure: false,
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  }
})
