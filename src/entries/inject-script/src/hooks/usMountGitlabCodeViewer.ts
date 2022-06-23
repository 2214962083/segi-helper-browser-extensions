import {useStyleTag} from '@vueuse/core'
import type {Lang} from 'shiki'
import {App, createApp, defineComponent, h, Ref, watch} from 'vue'
import {win} from '../utils/common'
import CodeViewer from '../components/CodeViewer.vue'

interface UsMountGitlabCodeViewerOptions {
  code: Ref<string>
  lang: Ref<Lang>
}

// code viewer 注入函数
export function usMountGitlabCodeViewer(options: UsMountGitlabCodeViewerOptions) {
  const {code, lang} = options

  // 原来的 gitlab file 显示区域
  const targetEl = win.document.querySelector<HTMLElement>('.blob-viewer')
  if (!targetEl) return {}
  targetEl.style.position = 'relative'
  useStyleTag(
    // 盖在原来的 gitlab file 显示区域上
    `
      #segi-gitlab-file-viewer-mount-el {
        width: 100% !important;
        height: 100% !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        z-index: 99 !important;
      }
  `
  )

  // vue 容器 element id
  const mountedElId = 'segi-gitlab-file-viewer-mount-el'

  // vue 实例
  let app: App | undefined

  // vue 容器 element
  let mountedEl = win.document.querySelector<HTMLElement>(`#${mountedElId}`)

  const _updateMountedEl = () => {
    if (!mountedEl) {
      // 如果不存在 vue 容器，则创建一个
      mountedEl = win.document.createElement('div')
      mountedEl.id = mountedElId
      targetEl.appendChild(mountedEl)
    }
  }

  // 挂载 code viewer
  const _mounted = () => {
    _unmounted()
    _updateMountedEl()

    // 创建 vue 实例
    app = createApp(
      defineComponent({
        name: 'App',
        data() {
          return {
            code: code.value,
            lang: lang.value
          }
        },
        beforeMount() {
          // 在销毁前找到原来的 gitlab 默认 viewer，显示它
          const oldViewer = win.document.querySelector<HTMLElement>('.blob-viewer .blob-viewer')
          if (oldViewer) oldViewer.style.display = 'block'
        },
        methods: {
          // 当 shiki 染完色、生成 html 后，调用此函数
          handleCodeViewerRendered() {
            // 找到原来的 gitlab 默认 viewer，隐藏它
            const oldViewer = win.document.querySelector<HTMLElement>('.blob-viewer .blob-viewer')
            if (oldViewer) oldViewer.style.display = 'none'
          }
        },
        render() {
          return h(CodeViewer, {
            code: this.code,
            lang: this.lang,
            onRendered: this.handleCodeViewerRendered
          })
        }
      })
    )

    // 挂载 vue 实例
    app?.mount(mountedEl)
  }

  // 删除 code viewer
  const _unmounted = () => {
    if (app) app.unmount()
    app = undefined
    mountedEl?.remove()
    mountedEl = null
  }

  watch(
    code,
    () => {
      if (code.value) {
        _mounted()
      }
    },
    {
      immediate: true
    }
  )

  return
}
