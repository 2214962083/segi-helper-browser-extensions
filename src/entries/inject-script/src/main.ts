/* @refresh reload */
import {createApp} from 'vue'
import App from './App.vue'
import '@/common/styles/global.css'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './services' // 初始化 services
import {usePreviewMenu} from './utils/uhomecp-preview'
import {useGitlabCodeTreeView} from './utils/uhomecp-gitlab-tree'
import {setNamespace} from 'webext-bridge'
import {MESSAGE_NAMESPACE} from '@/common/utils/constants'

console.log('inject script init', window)
setNamespace(MESSAGE_NAMESPACE) // 设置命名空间

const appContainer = document.createElement('div')
document.body.appendChild(appContainer)
createApp(App).mount(appContainer)

console.log('usePreviewMenu starting...')
usePreviewMenu(['beta.uhomecp.com'])?.start()
useGitlabCodeTreeView(['192.168.1.6:9200', 'gitlab.uhomecp.com'])?.start()
