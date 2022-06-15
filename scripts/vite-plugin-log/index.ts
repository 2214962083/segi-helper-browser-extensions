import {Plugin, ResolvedConfig, ViteDevServer} from 'vite'
import {getCommonServerUrls} from './utils'

export const LogPlugin = () => {
  let server: ViteDevServer
  let config: ResolvedConfig

  return {
    name: 'vite-plugin-log',
    enforce: 'post',
    apply: 'serve',
    configResolved(_config) {
      config = _config
    },
    configureServer(_server) {
      server = _server
      const oldPrintUrls = server.printUrls
      server.printUrls = async function (...args) {
        const result = await oldPrintUrls.apply(this, args)

        const urls = getCommonServerUrls(server.httpServer!, config.server, config)
        console.log('\n\n浏览器扩展多个页面:\n', urls)
        // urls.map(item => {
        //   Object.entries(item).forEach(([name, url]) => {
        //     console.log(`${name}: ${url}`)
        //   })
        // })

        return result
      }
    }
  } as Plugin
}
