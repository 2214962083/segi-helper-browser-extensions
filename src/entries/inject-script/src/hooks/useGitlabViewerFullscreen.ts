import {Ref, watch} from 'vue'
import {win} from '../utils/common'
import {useLocalStorage, useStyleTag, useWindowSize} from '@vueuse/core'

export interface UseGitlabViewerFullscreenOptions {
  marginLeft: Ref<number>
}

export function useGitlabViewerFullscreen(options: UseGitlabViewerFullscreenOptions) {
  const {marginLeft} = options

  // 是否全屏预览
  const isFullscreen = useLocalStorage('gitlab-isFullscreen', false) as Ref<boolean>

  const {css} = useStyleTag('')

  const _updateStyle = () => {
    if (!isFullscreen.value) return

    const windowWidth = win.innerWidth
    css.value = `
    html {
      overflow: hidden;
    }

    .blob-viewer {
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      width: ${windowWidth - marginLeft.value}px !important;
      height: 100vh !important;
      z-index: 1024 !important;
      overflow: hidden !important;
      background-color: #fff !important;
    }

    .blob-viewer .blob-viewer {
      overflow: auto !important;
    }

    #segi-gitlab-file-viewer-mount-el pre {
      width: 100% !important;
      height: 100vh !important;
      overflow: auto !important;
      border: none !important;
    }
    `
  }

  const start = () => {
    _updateStyle()
  }

  const stop = () => {
    css.value = ''
  }

  watch(
    isFullscreen,
    val => {
      val ? start() : stop()
    },
    {
      immediate: true
    }
  )

  watch(
    marginLeft,
    () => {
      _updateStyle()
    },
    {
      immediate: true
    }
  )

  const {width: windowWidth} = useWindowSize()

  watch(windowWidth, () => {
    _updateStyle()
  })

  return {isFullscreen}
}
