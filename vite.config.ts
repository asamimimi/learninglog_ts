import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 相対パスでアセットを参照
  plugins: [react()],
  build: {
    outDir: 'dist', // 出力ディレクトリ
  },
})