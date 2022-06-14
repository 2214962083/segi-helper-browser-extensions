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
      }),
      webExtension({
        manifest: getManifest(Number(MANIFEST_VERSION))
      }),
      Unocss({
        presets: [presetUno(), presetAttributify(), presetIcons()],
        shortcuts: {
          'bg-hover': 'hover:bg-gray:15',
          'icon-hover': 'op50 hover:op100'
        }
      })
    ],
    build: {
      target: 'es2015',
      polyfillDynamicImport: false
    },
    resolve: {
      alias: [
        {
          find: '@', // js、ts别名
          replacement: pathResolve('./src')
        }
      ]
    }
  }
})
