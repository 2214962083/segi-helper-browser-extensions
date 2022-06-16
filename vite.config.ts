/* eslint-disable @typescript-eslint/no-unused-vars */
import {defineConfig, loadEnv} from 'vite'
import webExtension from '@samrum/vite-plugin-web-extension'
import path from 'path'
import {getManifest} from './src/manifest'
import Vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import Unocss from 'unocss/vite'
import {presetAttributify, presetIcons, presetUno} from 'unocss'
import {LogPlugin} from './scripts/vite-plugin-log'

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
