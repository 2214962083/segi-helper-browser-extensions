<template>
  <div class="setting-list w-full h-full flex flex-col">
    <!-- 设置选项 -->
    <div
      v-for="(setting, i) in settings"
      :key="i"
      class="setting-item border-b border-gray-100 cursor-pointer flex-shrink-0 h-12 flex items-center justify-between"
    >
      <!-- 设置标题 -->
      <div class="setting-item-left text-14px">
        {{ setting.title }}
      </div>

      <!-- 设置开关 -->
      <div class="setting-item-right">
        <el-switch v-model="setting.status" @change="handleStatusChange($event, setting.code)"></el-switch>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BaseFeatureService,
  FeaturesManager,
  GitlabGlobalSearchFeatureService,
  GitlabViewerFeatureService,
  UhomecpGlobalSearchFeatureService,
  UhomecpPreviewMenuFeatureService
} from '@/common/services/features'
import {useInit} from '@/entries/inject-script/src/hooks/useInit'
import {onMounted, ref} from 'vue'

enum SettingCode {
  uhomecpGlobalSearch = 'uhomecpGlobalSearch',
  uhomecpMenuPreview = 'uhomecpMenuPreview',
  gitlabGlobalSearch = 'gitlabGlobalSearch',
  gitlabFileViewer = 'gitlabFileViewer'
}

interface Setting {
  title: string
  code: SettingCode
  status: boolean
}

// 设置 json 配置
const settings = ref<Setting[]>([
  {
    title: 'uhomecp 全局搜索',
    code: SettingCode.uhomecpGlobalSearch,
    status: true
  },
  {
    title: 'uhomecp 菜单预览',
    code: SettingCode.uhomecpMenuPreview,
    status: true
  },
  {
    title: 'gitlab 全局搜索',
    code: SettingCode.gitlabGlobalSearch,
    status: true
  },
  {
    title: 'gitlab 代码侧栏树和染色',
    code: SettingCode.gitlabFileViewer,
    status: true
  }
])

const featuresManager = FeaturesManager.getInstance()
let gitlabGlobalSearchFeatureService: GitlabGlobalSearchFeatureService | undefined
let gitlabViewerFeatureService: GitlabViewerFeatureService | undefined
let uhomecpGlobalSearchFeatureService: UhomecpGlobalSearchFeatureService | undefined
let uhomecpPreviewMenuFeatureService: UhomecpPreviewMenuFeatureService | undefined

const featureCodeMap = new Map<SettingCode, BaseFeatureService | undefined>()

const {init: initSettings} = useInit({
  initFn: async () => {
    gitlabGlobalSearchFeatureService = featuresManager.findService(GitlabGlobalSearchFeatureService)
    gitlabViewerFeatureService = featuresManager.findService(GitlabViewerFeatureService)
    uhomecpGlobalSearchFeatureService = featuresManager.findService(UhomecpGlobalSearchFeatureService)
    uhomecpPreviewMenuFeatureService = featuresManager.findService(UhomecpPreviewMenuFeatureService)
    featureCodeMap.set(SettingCode.gitlabGlobalSearch, gitlabGlobalSearchFeatureService)
    featureCodeMap.set(SettingCode.gitlabFileViewer, gitlabViewerFeatureService)
    featureCodeMap.set(SettingCode.uhomecpGlobalSearch, uhomecpGlobalSearchFeatureService)
    featureCodeMap.set(SettingCode.uhomecpMenuPreview, uhomecpPreviewMenuFeatureService)

    const featureServiceSyncStatus = <T extends InstanceType<typeof BaseFeatureService>>(
      featureService: T | undefined,
      code: SettingCode
    ) => {
      const currentSetting = settings.value.find(setting => setting.code === code)
      if (!currentSetting || !featureService) return

      currentSetting.status = featureService.isFeatureOn

      featureService.on('turnOn', () => {
        console.log('turn on', code)
        currentSetting.status = true
      })

      featureService.on('turnOff', () => {
        console.log('turnOff', code)
        currentSetting.status = false
      })
    }

    featureCodeMap.forEach((featureService, code) => {
      featureServiceSyncStatus(featureService, code)
    })
  }
})

initSettings()
onMounted(() => {
  initSettings()
})

function handleStatusChange(status: boolean, code: SettingCode) {
  console.log(`${code}`, status, featureCodeMap.get(code))
  status ? featureCodeMap.get(code)?.turnOn() : featureCodeMap.get(code)?.turnOff()
}
</script>

<style scoped></style>
