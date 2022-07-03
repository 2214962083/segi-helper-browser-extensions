import {copyToClipboard} from '@/common/utils/common'
import {UHOMECP_SHARE_TAB_STORAGE_NAMESPACE} from '@/common/utils/constants'
import {RemoteUhomecpMenu} from '@/common/utils/type-helper'
import {win} from '@/entries/inject-script/src/utils/common'
import {ElNotification} from 'element-plus'
import {BaseFeatureService, BaseFeatureServiceOptions, FeatureService, FeatureTask} from './BaseFeature.service'

export type UhomecpShareTabFeatureServiceOptions = Omit<BaseFeatureServiceOptions, 'storageKeyPrefix'>

/**
 * Uhomecp 分享 tab 功能服务
 */
export class UhomecpShareTabFeatureService extends BaseFeatureService implements FeatureService {
  constructor(options?: UhomecpShareTabFeatureServiceOptions) {
    super({
      storageKeyPrefix: UHOMECP_SHARE_TAB_STORAGE_NAMESPACE,
      defaultIncludeSites: ['192.168.1.11:10060', 'beta.uhomecp.com'],
      ...options
    })
  }

  async init(): Promise<void> {
    this.addMountedScriptTask(this.appendShareIconToTab())

    await super.init()

    console.log('UhomecpShareTabFeatureService init', this)
  }

  /**
   * 给 tab 添加共享 icon
   */
  appendShareIconToTab(): FeatureTask {
    let observe: MutationObserver
    let removeTask: Function[] = []

    const processTabEls = (tabEls: HTMLElement[]) => {
      tabEls.map(tabEl => {
        // tab 共享 icon
        const shareIcon = win.document.createElement('div')

        Object.assign(shareIcon.style, {
          width: '1rem',
          height: '1rem',
          color: '#0084ff',
          position: 'absolute',
          right: '1rem',
          top: '1rem',
          zIndex: '999',
          cursor: 'pointer'
        })

        shareIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        `

        shareIcon.addEventListener('click', e => {
          e.preventDefault()
          e.stopPropagation()

          // tab 信息
          const tabData = tabEl.querySelector('.star-kbua')?.__vue__?.$parent?.tabData as
            | (RemoteUhomecpMenu & {title: string; uuid: string})
            | undefined

          if (!tabData)
            return ElNotification.error({
              title: '复制失败',
              message: '找不到 tab 具体数据'
            })

          // tab 标题
          const tabTitle = tabData.title || tabData.customResName || tabData.resName

          // tab url
          // const tabUrl = tabData.url

          // tab 对应的 iframe
          const tabIframe = win.document.querySelector<HTMLIFrameElement>(`iframe[name*="_${tabData.uuid}"]`)

          if (!tabIframe || !tabIframe.contentWindow)
            return ElNotification.error({
              title: '复制失败',
              message: '找不到 iframe'
            })

          // tab iframe 内部的 location href
          const iframeLocation = tabIframe.contentWindow.location.href
          const iframeUri = new URL(iframeLocation)

          // 用 iframe 内部 href 作为打开 tab 的 url
          const urlForOpenPortalMenu = iframeUri.pathname + iframeUri.search + iframeUri.hash

          // 用 tab 的 title 作为打开 tab 的标题
          const titleForOpenPortalMenu = tabTitle

          // 这个是复制分享的代码
          const shareCode = `
/**
 * 我分享了一个 uhomecp tab 页给你
 * 复制这段代码，打开浏览器，按 F12 打开控制台，粘贴执行下面的代码
 * 根据勾股定理，一般情况下是可以执行成功的，如果不能，那就是量子力学的问题了
 */
const title = ${JSON.stringify(titleForOpenPortalMenu)}
const url = ${JSON.stringify(urlForOpenPortalMenu)}
top.openPortalMenu(url, title)`

          copyToClipboard(shareCode, () => {
            ElNotification.success({
              title: '复制成功',
              message: '快去分享给小伙伴吧'
            })
          })
          return false
        })

        tabEl.appendChild?.(shareIcon)

        removeTask.push(() => shareIcon?.remove?.())
      })
    }

    const start = () => {
      const tabWrapEl = win.document.querySelector('.tabs-pvh4 .transition-group-pvh4')
      if (!tabWrapEl) return

      const tabEls = Array.from(tabWrapEl.querySelectorAll<HTMLElement>('.tab-pvh4') ?? [])
      processTabEls(tabEls)

      // 监听 dom 变化，找出新的 tab，并添加 share icon
      observe = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            const tabEls: HTMLElement[] = []

            mutation.addedNodes.forEach(node => {
              const el = node as HTMLElement
              const tabEl = el?.classList?.contains?.('tab-pvh4') ? el : el?.querySelector?.<HTMLElement>('.tab-pvh4')
              tabEl && tabEls.push(tabEl)
            })
            processTabEls(tabEls)
          }
        })
      })

      observe.observe(tabWrapEl, {
        attributes: false,
        childList: true,
        subtree: true
      })
    }

    const stop = () => {
      observe?.disconnect()
      removeTask.map(fn => fn?.())
      removeTask = []
    }

    return {start, stop}
  }
}
