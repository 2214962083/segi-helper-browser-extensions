// import {onMessage} from 'webext-bridge'
import browser from 'webextension-polyfill'
import {WebextMessageId} from '@/common/utils/message-types'

// import './src/services'
// onMessage(WebextMessageId.searchBetaMenu, ({data}) => {
//   console.log('onMessage', data)
// })
console.log('browser.runtime', browser.runtime)
console.log('content-script main.ts')
