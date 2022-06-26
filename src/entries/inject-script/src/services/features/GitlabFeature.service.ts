import {GitlabService} from '../Gitlab.service'
import GitlabFileTree from '../../components/GitlabFileTree.vue'
import {
  BaseFeatureService,
  BaseFeatureServiceEvent,
  BaseFeatureServiceOptions,
  FeatureService
} from './BaseFeature.service'

export type GitlabFeatureServiceEvent = BaseFeatureServiceEvent
export type GitlabFeatureServiceOptions = Omit<BaseFeatureServiceOptions, 'storageKeyPrefix'>

export class GitlabFeatureService
  extends BaseFeatureService<GitlabFeatureServiceEvent>
  implements FeatureService<GitlabFeatureServiceEvent>
{
  gitlabService: GitlabService

  constructor(options?: GitlabFeatureServiceOptions) {
    super({
      storageKeyPrefix: 'GitlabFeatureService',
      defaultIncludeSites: ['192.168.1.6:9200', 'gitlab.uhomecp.com'],
      ...options
    })

    this.gitlabService = GitlabService.getInstance()
  }

  async init(): Promise<void> {
    await this.gitlabService.init()

    this.addMountedVueComponentTask(GitlabFileTree)

    await super.init()

    console.log('GitlabFeatureService init', this)
  }
}
