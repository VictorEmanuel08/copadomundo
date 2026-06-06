import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Carrega variáveis do .env incluindo VITE_ prefix
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // ── Proxy para football-data.org (resolve CORS em dev) ────────────
    server: {
      proxy: {
        '/fd-api': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/fd-api/, ''),
          headers: {
            'X-Auth-Token': env.VITE_FOOTBALL_DATA_TOKEN ?? '',
          },
        },
      },
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor';
              }
              if (id.includes('firebase')) {
                return 'firebase';
              }
              if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
                return 'query';
              }
            }
          },
        },
      },
    },
  }
})
