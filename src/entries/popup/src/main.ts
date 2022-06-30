import {createApp} from 'vue'
import App from './App.vue'
import '@/common/styles/global.css'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import {initFeatureService} from '@/common/services/features'

async function main() {
  initFeatureService()
  createApp(App).mount('#app')
}
main()
