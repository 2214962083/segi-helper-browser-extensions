import {GitlabService} from '@/entries/inject-script/src/services/Gitlab.service'
import GitlabFileTree from '@/entries/inject-script/src/components/GitlabFileTree.vue'
import {BaseFeatureService, BaseFeatureServiceOptions, FeatureService} from './BaseFeature.service'
import {GITLAB_VIEWER_STORAGE_NAMESPACE} from '@/common/utils/constants'

export type GitlabViewerFeatureServiceOptions = Omit<BaseFeatureServiceOptions, 'storageKeyPrefix'>

/**
 * gitlab 代码浏览功能服务
 */
export class GitlabViewerFeatureService extends BaseFeatureService implements FeatureService {
  gitlabService: GitlabService

  constructor(options?: GitlabViewerFeatureServiceOptions) {
    super({
      storageKeyPrefix: GITLAB_VIEWER_STORAGE_NAMESPACE,
      defaultIncludeSites: ['192.168.1.6:9200', 'gitlab.uhomecp.com'],
      ...options
    })

    this.gitlabService = GitlabService.getInstance()
  }

  async init(): Promise<void> {
    await this.gitlabService.init()

    if (this.gitlabService.isRepoPage) {
      this.addMountedVueComponentTask(GitlabFileTree)
    }

    await super.init()

    console.log('GitlabViewerFeatureService init', this)
  }
}
