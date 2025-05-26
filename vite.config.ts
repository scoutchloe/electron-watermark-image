import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  const isServe = command === 'serve'
  
  return {
    base: isServe ? '/' : './',
    plugins: [
      vue(),
      electron([
        {
          entry: 'electron/main.ts',
          onstart(options) {
            if (options.startup) {
              options.startup()
            }
          },
          vite: {
            build: {
              sourcemap: false,
              minify: false,
              outDir: 'dist-electron',
              rollupOptions: {
                external: ['electron']
              }
            }
          }
        },
        {
          entry: 'electron/preload.ts',
          onstart(options) {
            options.reload()
          },
          vite: {
            build: {
              sourcemap: false,
              minify: false,
              outDir: 'dist-electron',
              rollupOptions: {
                external: ['electron']
              }
            }
          }
        }
      ]),
      renderer()
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@/styles/variables" as *; @use "@/styles/mixins" as *;`
        }
      }
    },
    server: {
      port: 5173
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            elementPlus: ['element-plus']
          }
        }
      }
    }
  }
}) 