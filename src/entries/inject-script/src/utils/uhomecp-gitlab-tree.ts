import {useAppContainer} from '@/common/utils/common'
import type {TreeOptionProps} from 'element-plus/lib/components/tree/src/tree.type'
import {win} from './common'
import GitlabFileTree from '../components/GitlabFileTree.vue'
import {App, createApp} from 'vue'

export interface GitlabFileTreeItem extends TreeOptionProps {
  /**
   * 文件路径
   */
  url: string

  /**
   * 是否是文件
   */
  isFile: boolean
}

function getFileTree() {
  const treeItemEls = Array.from(win.document.querySelectorAll('.tree-item-file-name'))
  const treeNodes: GitlabFileTreeItem[] = []
  treeItemEls.map(treeItemEl => {
    const isFolder = Boolean(treeItemEl.querySelector('i.fa-folder'))
    const infoEl = treeItemEl.querySelector<HTMLLinkElement>('.str-truncated')
    if (!infoEl) return
    treeNodes.push({
      label: infoEl.title,
      url: infoEl.href ?? '',
      isFile: !isFolder
    })
  })
  return treeNodes
}

// function useTreeDrawerSwitchButton() {
//   const btn = win.document.createElement('div')
//   Object.assign(btn.style, <Partial<CSSStyleDeclaration>>{
//     width: '2rem',
//     height: '8rem',
//     padding: '1rem',
//     cursor: 'pointer',
//     overflow: 'hidden',
//     fontSize: '12px',
//     display: 'none',
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'column',
//     position: 'fixed',
//     top: 'calc(50vh - 8rem)',
//     left: '0',
//     zIndex: '9999',
//     backgroundColor: '#fff',
//     boxShadow: '2px 4px 8px rgba(0, 0, 0, 0.2)',
//     borderTopRightRadius: '0.5rem',
//     borderBottomRightRadius: '0.5rem',
//     whiteSpace: 'wrap'
//   })
//   btn.innerHTML = `代码目录`
//   win.document.body.appendChild(btn)

//   const show = () => {
//     btn.style.display = 'flex'
//   }

//   const hide = () => {
//     btn.style.display = 'none'
//   }

//   return {
//     btn,
//     show,
//     hide
//   }
// }

/**
 * 生成 gitlab 文件树
 * @param urlRegExps 正则表达式数组，只有 url 符合正则表达式才会触发生成代码目录文件树
 */
export function useGitlabCodeTreeView(urlRegExps: (RegExp | string)[] = []) {
  const currentUrl = win.location.href
  if (urlRegExps.every(urlRegExp => !currentUrl.match(urlRegExp))) return

  const {appContainer, removeAppContainer} = useAppContainer()

  let app: App
  const start = () => {
    app = createApp(GitlabFileTree)
    app.mount(appContainer)
  }

  const stop = () => {
    app.unmount()
    removeAppContainer()
  }

  return {
    start,
    stop
  }
}
