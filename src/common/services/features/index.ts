import {FeaturesManager} from './BaseFeature.service'
import {DocleverGlobalSearchFeatureService} from './DocleverGlobalSearchFeature.service'
import {GitlabGlobalSearchFeatureService} from './GitlabGlobalSearchFeature.service'
import {GitlabViewerFeatureService} from './GitlabViewerFeature.service'
import {UhomecpGlobalSearchFeatureService} from './UhomecpGlobalSearchFeature.service'
import {UhomecpPreviewMenuFeatureService} from './UhomecpPreviewMenuFeature.service'

export * from './BaseFeature.service'
export * from './GitlabViewerFeature.service'
export * from './GitlabGlobalSearchFeature.service'
export * from './UhomecpPreviewMenuFeature.service'
export * from './UhomecpGlobalSearchFeature.service'
export * from './DocleverGlobalSearchFeature.service'

/**
 * 初始化所有功能
 * 注意,不管在任何窗口, 只能初始化一次, 请勿在同一个 context 重复初始化
 */
export async function initFeatureService() {
  const featuresManager = FeaturesManager.getInstance()
  featuresManager.addFeature(new GitlabGlobalSearchFeatureService())
  featuresManager.addFeature(new GitlabViewerFeatureService())
  featuresManager.addFeature(new UhomecpPreviewMenuFeatureService())
  featuresManager.addFeature(new UhomecpGlobalSearchFeatureService())
  featuresManager.addFeature(new DocleverGlobalSearchFeatureService())
  await featuresManager.init()
  return featuresManager
}
