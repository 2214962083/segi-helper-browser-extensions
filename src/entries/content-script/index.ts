import './src/services' // 初始化 services
import {injectPreviewMenu} from './src/utils/uhomecp-preview'

// Firefox `browser.tabs.executeScript()` 要求脚本返回原始值
;(() => {
  injectPreviewMenu()
  console.log('content-script init', window)
})()
