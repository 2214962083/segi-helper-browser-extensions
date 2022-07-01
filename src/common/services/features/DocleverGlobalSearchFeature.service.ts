import {DOCLEVER_GLOBAL_SEARCH_STORAGE_NAMESPACE} from '@/common/utils/constants'
import DocleverGlobalSearch from '@/entries/inject-script/src/components/DocleverGlobalSearch/DocleverGlobalSearch.vue'
import {BaseFeatureService, BaseFeatureServiceOptions, FeatureService} from './BaseFeature.service'

export type DocleverGlobalSearchFeatureServiceOptions = Omit<BaseFeatureServiceOptions, 'storageKeyPrefix'>

/**
 * doclever 全局搜索功能服务
 */
export class DocleverGlobalSearchFeatureService extends BaseFeatureService implements FeatureService {
  constructor(options?: DocleverGlobalSearchFeatureServiceOptions) {
    super({
      storageKeyPrefix: DOCLEVER_GLOBAL_SEARCH_STORAGE_NAMESPACE,
      defaultIncludeSites: ['192.168.1.10:9090', '192.168.1.11:9090'],
      defaultExcludeSites: ['/html/web/controller/login/login.html'],
      ...options
    })
  }

  async init(): Promise<void> {
    this.addMountedVueComponentTask(DocleverGlobalSearch)

    await super.init()

    console.log('DocleverGlobalSearchFeatureService init', this)
  }
}
