import {runInPageContext} from '@/common/utils/run-in-page-context'
import injectUhomecpPreviewJs from '../inject-js/inject-uhomecp-preview.js?raw'

// 注入预览菜单功能
export async function injectPreviewMenu() {
  return await runInPageContext({
    args: [],
    func: `() => {
      ${injectUhomecpPreviewJs}
    }`
  })
}
