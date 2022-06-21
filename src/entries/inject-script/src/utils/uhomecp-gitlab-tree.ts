import {useAppContainer} from '@/common/utils/common'
import {win} from './common'
import GitlabFileTree from '../components/GitlabFileTree.vue'
import {App, createApp} from 'vue'
import {GitlabService} from '../services/Gitlab.service'

/**
 * 生成 gitlab 文件树
 * @param urlRegExps 正则表达式数组，只有 url 符合正则表达式才会触发生成代码目录文件树
 */
export function useGitlabCodeTreeView(urlRegExps: (RegExp | string)[] = []) {
  const currentUrl = win.location.href
  if (urlRegExps.every(urlRegExp => !currentUrl.match(urlRegExp))) return

  const {appContainer, removeAppContainer} = useAppContainer()

  const gitlabService = GitlabService.getInstance()
  gitlabService.init()

  let app: App | undefined
  const start = () => {
    // 不是仓库页面，不生成代码目录文件树
    if (!gitlabService.isRepoPage) return
    app = createApp(GitlabFileTree)
    app.mount(appContainer)
  }

  const stop = () => {
    app?.unmount()
    removeAppContainer()
  }

  return {
    start,
    stop
  }
}
