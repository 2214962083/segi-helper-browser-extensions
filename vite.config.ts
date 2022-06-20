/* eslint-disable @typescript-eslint/no-unused-vars */
import {defineConfig, loadEnv} from 'vite'
import webExtension from '@samrum/vite-plugin-web-extension'
import path from 'path'
import {fileURLToPath} from 'url'
import {getManifest} from './src/manifest'
import Vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import Unocss from 'unocss/vite'
import {presetAttributify, presetIcons, presetUno} from 'unocss'
import {LogPlugin} from './scripts/vite-plugin-log'
import {InjectScriptPlugin} from './scripts/vite-plugin-inject-script'

const pathResolve = (..._path: string[]) => path.resolve(__dirname, ..._path)

const MANIFEST_VERSION = 2

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      host: true
    },
    plugins: [
      Vue(),
      vueJsx(),
      Components({
        resolvers: [ElementPlusResolver()]
      }), // 按需引入vue组件
      webExtension({
        manifest: getManifest(Number(MANIFEST_VERSION))
      }), // 浏览器扩展多入口打包
      InjectScriptPlugin({
        outputJsName: 'inject-script.js',
        entryHtml: pathResolve('src/entries/inject-script/index.html'),
        htmlMatchRegExp: /html-regexp-inject-script/
      }),
      Unocss({
        presets: [presetUno(), presetAttributify(), presetIcons()],
        shortcuts: {
          'bg-hover': 'hover:bg-gray:15',
          'icon-hover': 'op50 hover:op100'
        }
      }), // 类似 tailwind，按需生成css
      LogPlugin() // 打印浏览器扩展多页面地址
    ],
    build: {
      target: 'es2015',
      polyfillDynamicImport: false,
      // https://developer.chrome.com/docs/webstore/program_policies/#:~:text=Code%20Readability%20Requirements
      terserOptions: {
        mangle: false
      }
      // rollupOptions: {
      //   input: {
      //     'inject-script': pathResolve('src/entries/inject-script/index.ts')
      //     // 'inject-script': fileURLToPath(new URL('./src/entries/inject-script/index.html', import.meta.url))
      //   },
      //   output: {
      //     dir: pathResolve('dist'),
      //     // chunkFileNames: `assets/[name].[hash].js`,
      //     // assetFileNames: `assets/[name].[hash].[ext]`,
      //     entryFileNames: chunk => {
      //       const createName = (name?: string) => `assets/` + (name ? name : '[name].[hash].js')
      //       if (chunk?.name?.startsWith('inject-script')) {
      //         return createName(`inject-script.js`)
      //       }
      //       return createName()
      //     }
      //   }
      // }
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: pathResolve('./src')
        }
      ]
    }
  }
})
