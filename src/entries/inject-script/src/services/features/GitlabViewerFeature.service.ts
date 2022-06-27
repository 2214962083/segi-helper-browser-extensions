import {GitlabService} from '../Gitlab.service'
import GitlabFileTree from '../../components/GitlabFileTree.vue'
import {BaseFeatureService, BaseFeatureServiceOptions, FeatureService} from './BaseFeature.service'

export type GitlabViewerFeatureServiceOptions = Omit<BaseFeatureServiceOptions, 'storageKeyPrefix'>

export class GitlabViewerFeatureService extends BaseFeatureService implements FeatureService {
  gitlabService: GitlabService

  constructor(options?: GitlabViewerFeatureServiceOptions) {
    super({
      storageKeyPrefix: 'GitlabViewerFeatureService',
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
