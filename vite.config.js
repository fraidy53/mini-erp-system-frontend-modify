import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

// ESM 환경에서 __dirname을 대신할 경로 설정
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      // 이제 "@"를 사용하여 src 폴더에 접근할 수 있습니다.
      "@": path.resolve(__dirname, "./src"),
    },
  },
})