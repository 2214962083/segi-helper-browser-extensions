import browser from 'webextension-polyfill'
import {MESSAGE_NAMESPACE} from '@/common/utils/constants'
import {allowWindowMessaging} from 'webext-bridge'

// // Firefox `browser.tabs.executeScript()` 要求脚本返回原始值
;(() => {
  // content-script 环境
  console.log('content script append script', 'content-script 环境')
  allowWindowMessaging(MESSAGE_NAMESPACE) // 允许 window 通信

  // 注入 inject-script 到页面
  const script = document.createElement('script')
  script.src = browser.runtime.getURL('inject-script.js')
  script.id = 'segi-extension-inject-script'
  script.dataset.extensionId = browser.runtime.id
  script.dataset.baseurl = browser.runtime.getURL('assets/')
  document.documentElement.appendChild(script)

  console.log('content-script init', window)
})()
