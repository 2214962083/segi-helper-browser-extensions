import {FeaturesManager} from './BaseFeature.service'
import {GitlabGlobalSearchFeatureService} from './GitlabGlobalSearchFeature'
import {GitlabViewerFeatureService} from './GitlabViewerFeature.service'
import {UhomecpGlobalSearchFeatureService} from './UhomecpGlobalSearchFeature'
import {UhomecpPreviewMenuFeatureService} from './UhomecpPreviewMenuFeature.service'

export * from './BaseFeature.service'
export * from './GitlabViewerFeature.service'
export * from './UhomecpPreviewMenuFeature.service'

/**
 * 初始化所有功能
 */
export async function initFeatureService() {
  const featuresManager = FeaturesManager.getInstance()
  featuresManager.addFeature(new GitlabGlobalSearchFeatureService())
  featuresManager.addFeature(new GitlabViewerFeatureService())
  featuresManager.addFeature(new UhomecpPreviewMenuFeatureService())
  featuresManager.addFeature(new UhomecpGlobalSearchFeatureService())
  await featuresManager.init()
  return featuresManager
}
