import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // Split PDF.js into separate chunk
          if (id.includes('pdfjs-dist') || id.includes('pdf.js')) {
            return 'pdf';
          }
          // Split mammoth into separate chunk
          if (id.includes('mammoth')) {
            return 'docx';
          }
          // Split React into separate chunk
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  worker: {
    format: 'es'
  }
});
