import UhomecpGlobalSearch from '../../components/UhomecpGlobalSearch/UhomecpGlobalSearch.vue'
import {BaseFeatureService, BaseFeatureServiceOptions, FeatureService} from './BaseFeature.service'

export type UhomecpGlobalSearchFeatureServiceOptions = Omit<BaseFeatureServiceOptions, 'storageKeyPrefix'>

export class UhomecpGlobalSearchFeatureService extends BaseFeatureService implements FeatureService {
  constructor(options?: UhomecpGlobalSearchFeatureServiceOptions) {
    super({
      storageKeyPrefix: 'UhomecpGlobalSearchFeatureService',
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
