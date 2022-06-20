import browser from 'webextension-polyfill'
import {MESSAGE_NAMESPACE} from '@/common/utils/constants'
import {allowWindowMessaging} from 'webext-bridge'

// // Firefox `browser.tabs.executeScript()` 要求脚本返回原始值
;(() => {
  // content-script 环境
  console.log('content script append script', 'content-script 环境')
  allowWindowMessaging(MESSAGE_NAMESPACE) // 允许 window 通信

  // 修复开发时 chrome.runtime.id 为空的问题
  const preScript = document.createElement('script')
  preScript.innerHTML = `
    // 添加 chrome id ${browser.runtime.id}
    if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
      if (!window.chrome) window.chrome = {}
      if (!chrome.runtime) chrome.runtime = {}
      if (!chrome.runtime.id) chrome.runtime = {
        ...chrome.runtime,
        get id() {
          return '${browser.runtime.id}'
        }
      }
    }

    // 处理 inject-script html 内容
    // 把 /assets 开头的资源替换成类似 chrome-extension://xxxxxx/assets 的路径
    window.processInjectScriptHtml = html => {
      return html.replace(/"\\/assets\\//g, '"${browser.runtime.getURL('assets/')}')
    }
  `
  document.documentElement.appendChild(preScript)

  // 注入 inject-script 到页面
  const script = document.createElement('script')
  script.src = browser.runtime.getURL('inject-script.js')
  document.documentElement.appendChild(script)

  console.log('content-script init', window)
})()
