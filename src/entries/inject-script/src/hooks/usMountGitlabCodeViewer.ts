import {useResizeObserver, useStyleTag} from '@vueuse/core'
import type {Lang} from 'shiki'
import {App, createApp, defineComponent, h, onUnmounted, ref, Ref, watch} from 'vue'
import {getElementStyle, win} from '../utils/common'
import CodeViewer from '../components/CodeViewer.vue'
import {useCanvasDrawerFromElement} from './useCanvasDrawerFromElement'

interface UsMountGitlabCodeViewerOptions {
  /**
   * 代码文本内容
   */
  code: Ref<string>

  /**
   * 代码语言
   */
  lang: Ref<Lang>
}

/**
 * 用于挂载 code viewer 组件覆盖原来的代码浏览区
 */
export function usMountGitlabCodeViewer(options: UsMountGitlabCodeViewerOptions) {
  const {code, lang} = options

  // 原来的 gitlab file 显示区域
  const targetEl = win.document.querySelector<HTMLElement>('.blob-viewer')
  if (!targetEl) return
  targetEl.style.position = 'relative'

  // vue 容器 element id
  const mountedElId = 'segi-gitlab-file-viewer-mount-el'

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

      #${mountedElId} {
        position: relative;
      }

      #${mountedElId} .minimap-container {
        height: 100%;
        position: absolute;
        top: 0;
        right: 14px;
        z-index: 999;
      }

      #${mountedElId} .minimap-shadow {
        position: absolute;
        left: -6px;
        width: 6px;
        height: 100%;
        box-shadow: rgb(0, 0, 0, 0.53) -6px 0 6px -6px inset;
      }

      #${mountedElId} .minimap-canvas {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
      }
  `
  )

  // vue 实例
  let app: App | undefined

  // vue 容器 element
  let mountedEl = win.document.querySelector<HTMLElement>(`#${mountedElId}`)

  const _updateMountedEl = () => {
    // 如果存在 vue 容器，则清空
    if (mountedEl) mountedEl.remove()

    mountedEl = win.document.createElement('div')
    mountedEl.id = mountedElId
    targetEl.appendChild(mountedEl)
  }

  // 挂载 code viewer
  const _mounted = () => {
    // 挂载前先卸载老的实例
    _unmounted()

    // 更新一下 vue 容器
    _updateMountedEl()

    // 创建 vue 实例
    app = createApp(
      defineComponent({
        name: 'App',
        setup() {
          const _code = ref(code.value)
          const _lang = ref(lang.value)

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          function insertCodePreviewElm() {
            if (!mountedEl) return

            // code element 父级 pre element
            const codePreEl = mountedEl.querySelector<HTMLElement>('pre')
            console.log('codePreEl', codePreEl)
            if (!codePreEl) return

            // 缩放倍数
            const scale = 0.125

            // 缩放前面的视图宽度
            const getPreviewPreElWidth = () => codePreEl.offsetWidth * 0.5

            // 克隆代码 element
            const codePreElClone = codePreEl.cloneNode() as HTMLElement

            // 设置一下代码 element 的样式为原来的样式(如果不这样做，render to canvas 只会生效行间样式)
            Object.assign(codePreElClone.style, {
              fontSize: getElementStyle(codePreEl, 'fontSize'),
              fontFamily: getElementStyle(codePreEl, 'fontFamily')
            } as CSSStyleDeclaration)

            const {canvas} = useCanvasDrawerFromElement({
              element: codePreEl,
              width: getPreviewPreElWidth(),
              height: codePreEl.scrollHeight
            })

            // 设置代码预览区要缩放到的宽度
            const setCanvasScaleToWith = (width: number) => {
              // 代码预览区最大宽度
              const maxWidth = 120

              // 代码预览区最小宽度
              const minWidth = 60

              // 代码预览区缩小后的宽度
              const withAfterScale = width

              //  代码预览区最终要缩放到的宽度
              const scaleToWith = Math.min(maxWidth, Math.max(minWidth, withAfterScale))

              canvas.style.transform = `scale(${scaleToWith / getPreviewPreElWidth()})`
              return scaleToWith
            }

            // 右侧代码预览区容器
            const minimapContainer = win.document.createElement('div')
            minimapContainer.classList.add('minimap-container')
            minimapContainer.style.backgroundColor = getElementStyle(codePreEl, 'background-color')

            // 计算设置合适的宽度
            const canvasDisplayWidth = setCanvasScaleToWith(getPreviewPreElWidth() * scale)
            minimapContainer.style.width = `${canvasDisplayWidth}px`

            // 右侧代码预览区左边的阴影
            const minimapShadow = win.document.createElement('div')
            minimapShadow.classList.add('minimap-shadow')
            minimapContainer.appendChild(minimapShadow)

            // 代码预览 canvas
            canvas.classList.add('minimap-canvas')
            minimapContainer.appendChild(canvas)

            // 挂载到代码预览区 element
            mountedEl.appendChild(minimapContainer)

            console.log('mountedEl', mountedEl)

            // 当代码区尺寸变了，更新一下 canvas 尺寸
            useResizeObserver(codePreEl, () => {
              // 计算更新代码预览区宽度
              const canvasDisplayWidth = setCanvasScaleToWith(getPreviewPreElWidth() * scale)
              minimapContainer.style.width = `${canvasDisplayWidth}px`
            })
          }

          // 当 shiki 染完色、生成 html 后，调用此函数
          function handleCodeViewerRendered() {
            // 找到原来的 gitlab 默认 viewer，隐藏它
            const oldViewer = win.document.querySelector<HTMLElement>('.blob-viewer .blob-viewer')
            if (oldViewer) oldViewer.style.display = 'none'

            // setTimeout(() => {
            //   insertCodePreviewElm()
            // }, 300)
          }

          onUnmounted(() => {
            // 在销毁前找到原来的 gitlab 默认 viewer，显示它
            const oldViewer = win.document.querySelector<HTMLElement>('.blob-viewer .blob-viewer')
            if (oldViewer) oldViewer.style.display = 'block'
          })

          return () =>
            h(CodeViewer, {
              code: _code.value,
              lang: _lang.value,
              onRendered: handleCodeViewerRendered
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
