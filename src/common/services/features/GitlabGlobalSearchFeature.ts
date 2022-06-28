import {GitlabService} from '@/entries/inject-script/src/services/Gitlab.service'
import GitlabGlobalSearch from '@/entries/inject-script/src/components/GitlabGlobalSearch.vue'
import {BaseFeatureService, BaseFeatureServiceOptions, FeatureService} from './BaseFeature.service'
import {GITLAB_GLOBAL_SEARCH_STORAGE_NAMESPACE} from '@/common/utils/constants'

export type GitlabGlobalSearchFeatureServiceOptions = Omit<BaseFeatureServiceOptions, 'storageKeyPrefix'>

export class GitlabGlobalSearchFeatureService extends BaseFeatureService implements FeatureService {
  gitlabService: GitlabService

  constructor(options?: GitlabGlobalSearchFeatureServiceOptions) {
    super({
      storageKeyPrefix: GITLAB_GLOBAL_SEARCH_STORAGE_NAMESPACE,
      defaultIncludeSites: ['192.168.1.6:9200', 'gitlab.uhomecp.com'],
      ...options
    })

    this.gitlabService = GitlabService.getInstance()
  }

  async init(): Promise<void> {
    await this.gitlabService.init()

    this.addMountedVueComponentTask(GitlabGlobalSearch)

    await super.init()

    console.log('GitlabGlobalSearchFeatureService init', this)
  }
}
