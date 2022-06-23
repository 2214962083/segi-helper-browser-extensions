import {useLocalStorage, useStyleTag} from '@vueuse/core'
import {Ref, watch} from 'vue'

export interface UseGitlabFileTreeDinOptions {
  drawerWidth: Ref<number>
}

export function useGitlabFileTreeDin(options: UseGitlabFileTreeDinOptions) {
  const {drawerWidth} = options

  // 是否固定在侧边
  const isDin = useLocalStorage('gitlab-isDin', false) as Ref<boolean>
  const {css} = useStyleTag('')

  const _updateStyle = () => {
    if (!isDin.value) return
    const marginLeft = drawerWidth.value + 'px'
    css.value = `
    .navbar-gitlab {
      left: ${marginLeft} !important;
    }

    .nav-sidebar {
      margin-left: ${marginLeft} !important;
    }

    .layout-page.page-with-contextual-sidebar {
      margin-left: ${marginLeft} !important;
    }
    `
  }

  const start = () => {
    _updateStyle()
  }

  const stop = () => {
    css.value = ''
  }

  watch(isDin, val => {
    val ? start() : stop()
  })

  watch(drawerWidth, () => {
    _updateStyle()
  })

  return {
    isDin
  }
}
