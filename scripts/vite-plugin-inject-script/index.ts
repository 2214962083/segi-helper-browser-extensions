/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Plugin, normalizePath} from 'vite'
import path from 'path'
import {cwd} from 'process'
import fs from 'fs'

export interface InjectScriptPluginOptions {
  /**
   * 输出的注入 js 文件名
   */
  outputJsName?: string

  /**
   * 入口 html 文件
   */
  entryHtml: string

  /**
   * 用于查找 html 的正则
   */
  htmlMatchRegExp: RegExp
}

/**
 * 一个用于提供
 * @param options 插件配置
 */
export const InjectScriptPlugin = (options: InjectScriptPluginOptions) => {
  const {entryHtml, htmlMatchRegExp, outputJsName = 'inject-script.js'} = options

  const pathResolve = (..._path: string[]) => path.resolve(cwd(), ..._path)

  // 输出文件夹
  let distDir = ''

  const getFileName = (_path: string) => path.basename(_path)

  return {
    name: 'vite-plugin-inject-script',
    enforce: 'post',
    configResolved(config) {
      if (!config.build.rollupOptions) config.build.rollupOptions = {}

      // 把旧的 input 转成 object 形式
      const oldInput = config.build.rollupOptions.input
      if (!oldInput) config.build.rollupOptions.input = {}
      if (typeof oldInput === 'string') {
        config.build.rollupOptions.input = {
          [getFileName(oldInput)]: oldInput
        }
      }
      if (Array.isArray(oldInput)) {
        config.build.rollupOptions.input = oldInput.reduce((acc, item) => {
          acc[getFileName(item)] = item
          return acc
        }, {} as Record<string, string>)
      }

      // 插入 input
      // @ts-ignore
      config.build.rollupOptions.input[getFileName(entryHtml)] = entryHtml

      distDir = normalizePath(pathResolve(config.build.outDir || 'dist'))
    },
    transformIndexHtml(html) {
      // console.log('transformIndexHtml', html)
      if (htmlMatchRegExp.test(html)) {
        // 匹配到了 inject script 的 html，保存
        const outputInjectJsPath = pathResolve(distDir, outputJsName)
        fs.writeFileSync(
          outputInjectJsPath,
          `
(() => {
  const win = top || window

  // 找到本 js 的 script 标签
  const injectScriptEl = win.document.querySelector('#segi-extension-inject-script')

  // 修复开发时 chrome.runtime.id 为空的问题
  if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
    if (!window.chrome) window.chrome = {}
    if (!chrome.runtime) chrome.runtime = {}
    if (!chrome.runtime.id) chrome.runtime = {
      ...chrome.runtime,
      get id() {
        return injectScriptEl && injectScriptEl.dataset.extensionId
      }
    }
  }

  // 替换资源基础 url
  win.processInjectScriptHtml = html => {
    if (!injectScriptEl) return html
    const baseurl = injectScriptEl.dataset.baseurl
    return html.replace(/"\\/assets\\//g,\`"\${baseurl}\`)
  }


  const processInjectScriptHtml = win.processInjectScriptHtml || (html => html)
  const htmlParser = new win.DOMParser()
  const htmlDoc = htmlParser.parseFromString(processInjectScriptHtml(${JSON.stringify(html)}), 'text/html')

  // 复制并插入 script 标签
  const copyScripts = (el, targetEl) => {
    const _scripts = Array.from(el.querySelectorAll('script'))
    const scripts = _scripts.map(_script => {
      const script = win.document.createElement('script')
      script.type = _script.type
      script.src = _script.src
      script.crossorigin = _script.crossorigin
      script.defer = _script.defer
      script.async = _script.async
      script.innerHTML = _script.innerHTML
      return script
    })
    targetEl.append(...scripts)
    return remove = () => scripts.map(scriptEl => scriptEl.remove())
  }

  // 复制并插入 style 标签
  const copyStyles = (el, targetEl) => {
    const _styles = Array.from(el.querySelectorAll('style'))
    const styles = _styles.map(_style => {
      const style = win.document.createElement('style')
      style.type = _style.type
      style.innerHTML = _style.innerHTML
      return style
    })
    targetEl.append(...styles)
    return remove = () => styles.map(styleEl => styleEl.remove())
  }

  // 复制并插入 links 标签
  const copyLinks = (el, targetEl) => {
    const _links = Array.from(el.querySelectorAll('link'))
    const links = _links.map(_link => {
      const link = win.document.createElement('link')
      link.rel = _link.rel
      link.href = _link.href
      link.crossorigin = _link.crossorigin
      link.type = _link.type
      link.media = _link.media
      link.sizes = _link.sizes
      link.integrity = _link.integrity
      link.async = _link.async
      return link
    })
    targetEl.append(...links)
    return remove = () => links.map(linkEl => linkEl.remove())
  }

  copyScripts(htmlDoc.head, win.document.head)

  let isLoadStyle = false
  let removeStyles = null
  let removeLinks = null

  win.segiHelperExtensionRemoveStyle = () => {
    removeStyles && removeStyles()
    removeLinks && removeLinks()
    isLoadStyle = false
  }

  win.segiHelperExtensionLoadStyle = () => {
    if (isLoadStyle) return
    removeStyles = copyStyles(htmlDoc.head, win.document.head)
    removeLinks = copyLinks(htmlDoc.head, win.document.head)
    isLoadStyle = true
  }
})();
        `,
          'utf-8'
        )
      }
      return html
    }
  } as Plugin
}
