import {FeaturesManager} from './BaseFeature.service'
import {GitlabFeatureService} from './GitlabFeature.service'
import {UhomecpPreviewMenuFeatureService} from './UhomecpPreviewMenuFeature.service'

export * from './BaseFeature.service'
export * from './GitlabFeature.service'
export * from './UhomecpPreviewMenuFeature.service'

/**
 * 初始化所有功能
 */
export async function initFeatureService() {
  const featuresManager = FeaturesManager.getInstance()
  featuresManager.addFeature(new GitlabFeatureService())
  featuresManager.addFeature(new UhomecpPreviewMenuFeatureService())
  await featuresManager.init()
  return featuresManager
}
