import {allowWindowMessaging} from 'webext-bridge'
import './src/services' // 初始化 services

// Firefox `browser.tabs.executeScript()` 要求脚本返回原始值
;(() => {
  console.log('content-script init')

  allowWindowMessaging('UhomecpContentScript')
})()
