/* @refresh reload */
import {createApp} from 'vue'
import App from './App.vue'
import '@/common/styles/global.css'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './services'
import {setNamespace} from 'webext-bridge'
import {MESSAGE_NAMESPACE} from '@/common/utils/constants'
import {initFeatureService} from '@/common/services/features'

console.log('inject script init', window)
setNamespace(MESSAGE_NAMESPACE) // 设置命名空间

const appContainer = document.createElement('div')
document.body.appendChild(appContainer)
createApp(App).mount(appContainer)

// 初始化功能服务
initFeatureService()
