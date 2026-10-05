/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: './',
    plugins: [react()],
    build: { outDir: 'dist' },
    test: {
        environment: 'jsdom',          // DOM を使えるようにする
        globals: true,                 // describe / it / expect を import なしで使う場合
        setupFiles: './src/setupTests.ts',
    },
})