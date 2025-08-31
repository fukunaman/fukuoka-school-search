import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages用のベースパス設定
  base: process.env.NODE_ENV === 'production' ? '/fukuoka-school-search/' : '/',
  
  root: '.',
  
  // publicディレクトリ設定
  publicDir: 'public',
  
  // ビルド設定
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    
    // GitHub Pages用の最適化
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          // 大きなデータファイルを分離
          'school-data': ['./src/data.ts']
        }
      }
    }
  },
  
  // 開発サーバー設定
  server: {
    port: 5173,
    open: true
  },
  
  // プレビューサーバー設定
  preview: {
    port: 4173,
    open: true
  }
})