import {UHOMECP_GLOBAL_SEARCH_STORAGE_NAMESPACE} from '@/common/utils/constants'
import UhomecpGlobalSearch from '@/entries/inject-script/src/components/UhomecpGlobalSearch/UhomecpGlobalSearch.vue'
import {win} from '@/entries/inject-script/src/utils/common'
import {BaseFeatureService, BaseFeatureServiceOptions, FeatureService, FeatureTask} from './BaseFeature.service'

export type UhomecpGlobalSearchFeatureServiceOptions = Omit<BaseFeatureServiceOptions, 'storageKeyPrefix'>

/**
 * Uhomecp 全局搜索功能服务
 */
export class UhomecpGlobalSearchFeatureService extends BaseFeatureService implements FeatureService {
  constructor(options?: UhomecpGlobalSearchFeatureServiceOptions) {
    super({
      storageKeyPrefix: UHOMECP_GLOBAL_SEARCH_STORAGE_NAMESPACE,
      defaultIncludeSites: ['192.168.1.11:10060', 'beta.uhomecp.com'],
      ...options
    })
  }

  async init(): Promise<void> {
    this.addMountedScriptTask(this.emitIframeKeyboardEventToTop())
    this.addMountedVueComponentTask(UhomecpGlobalSearch)

    await super.init()

    console.log('UhomecpGlobalSearchFeatureService init', this)
  }

  /**
   * 冒泡 iframe 的键盘事件
   */
  emitIframeKeyboardEventToTop(): FeatureTask {
    let observe: MutationObserver

    const listenIframeElsAndEmitToTop = (iframeEls: HTMLIFrameElement[] | null): void => {
      iframeEls?.map(iframeEl => {
        if (!iframeEl) return
        // 如果不这样做，鼠标放 iframe 时，随便按下按键，都不会触发顶层 window 键盘事件
        iframeEl.contentWindow?.addEventListener(
          'keydown',
          e => {
            if (e.ctrlKey && e.key === 'k') {
              win.dispatchEvent(
                new KeyboardEvent('keydown', {
                  code: 'ControlLeft',
                  ctrlKey: true,
                  key: 'Control'
                })
              )

              win.dispatchEvent(
                new KeyboardEvent('keydown', {
                  code: 'KeyK',
                  ctrlKey: true,
                  key: 'k'
                })
              )
              e.preventDefault()
            }
          },
          true
        )
      })
    }

    const start = () => {
      // 进来时先把已有的 iframe 的键盘事件冒泡到顶层 window
      const iframeEls = win.document.body.querySelectorAll<HTMLIFrameElement>('iframe') ?? []
      listenIframeElsAndEmitToTop(Array.from(iframeEls))

      // 监听 dom 变化，找出新的 iframe，并监听
      observe = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              const el = node as HTMLElement
              const iframeEls = el?.querySelectorAll?.<HTMLIFrameElement>('iframe') ?? []
              listenIframeElsAndEmitToTop(Array.from(iframeEls))
            })
          }
        })
      })

      observe.observe(win.document.body, {
        attributes: false,
        childList: true,
        subtree: true
      })
    }

    const stop = () => {
      observe?.disconnect()
    }

    return {start, stop}
  }
}
