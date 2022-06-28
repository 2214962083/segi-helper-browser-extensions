import {UHOMECP_GLOBAL_SEARCH_STORAGE_NAMESPACE} from '@/common/utils/constants'
import UhomecpGlobalSearch from '@/entries/inject-script/src/components/UhomecpGlobalSearch/UhomecpGlobalSearch.vue'
import {BaseFeatureService, BaseFeatureServiceOptions, FeatureService} from './BaseFeature.service'

export type UhomecpGlobalSearchFeatureServiceOptions = Omit<BaseFeatureServiceOptions, 'storageKeyPrefix'>

/**
 * Uhomecp 全局搜索功能服务
 */
export class UhomecpGlobalSearchFeatureService extends BaseFeatureService implements FeatureService {
  constructor(options?: UhomecpGlobalSearchFeatureServiceOptions) {
    super({
      storageKeyPrefix: UHOMECP_GLOBAL_SEARCH_STORAGE_NAMESPACE,
      defaultIncludeSites: ['192.168.1.11:10060', 'beta.uhomecp.com'],
      ...options
    })
  }

  async init(): Promise<void> {
    this.addMountedVueComponentTask(UhomecpGlobalSearch)

    await super.init()

    console.log('UhomecpGlobalSearchFeatureService init', this)
  }
}
