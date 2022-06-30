<template>
  <div class="setting-list w-full h-full flex flex-col">
    <!-- 设置选项 -->
    <div
      v-for="(setting, i) in settings"
      :key="i"
      class="setting-item border-b border-gray-100 cursor-pointer flex-shrink-0 h-12 flex items-center justify-between"
      @click="switchSettingStatus(setting)"
    >
      <!-- 设置标题 -->
      <div class="setting-item-left text-14px">
        {{ setting.title }}
      </div>

      <!-- 设置开关 -->
      <div class="setting-item-right" @click.stop="() => {}">
        <el-switch v-model="setting.status" @change="handleStatusChange($event, setting.code)"></el-switch>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BaseFeatureService,
  DocleverGlobalSearchFeatureService,
  FeaturesManager,
  GitlabGlobalSearchFeatureService,
  GitlabViewerFeatureService,
  UhomecpGlobalSearchFeatureService,
  UhomecpPreviewMenuFeatureService
} from '@/common/services/features'
import {useInit} from '@/entries/inject-script/src/hooks/useInit'
import {Class} from 'type-fest'
import {onMounted, ref} from 'vue'

/**
 * 设置功能编码
 */
enum SettingCode {
  /**
   * uhomecp 全局搜索功能开关
   */
  uhomecpGlobalSearch = 'uhomecpGlobalSearch',

  /**
   * uhomecp 预览功能开关
   */
  uhomecpMenuPreview = 'uhomecpMenuPreview',

  /**
   * gitlab 全局搜索功能开关
   */
  gitlabGlobalSearch = 'gitlabGlobalSearch',

  /**
   * gitlab 代码浏览功能开关
   */
  gitlabFileViewer = 'gitlabFileViewer',

  /**
   * doclever 全局搜索功能开关
   */
  docleverGlobalSearch = 'docleverGlobalSearch'
}

interface Setting {
  /**
   * 设置标题
   */
  title: string

  /**
   * 设置编码
   */
  code: SettingCode

  /**
   * 功能状态
   */
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
  },
  {
    title: 'doclever 全局搜索',
    code: SettingCode.docleverGlobalSearch,
    status: true
  }
])

// 功能管理器
const featuresManager = FeaturesManager.getInstance()

// 功能编码和功能服务实例映射
const featureCodeMap = new Map<SettingCode, BaseFeatureService | undefined>()

// 初始化一次
const {init: initSettings} = useInit({
  initFn: async () => {
    // 功能构造类和编码关系
    const featureConstructorCodeConfigs: Array<{code: SettingCode; featureConstructor: Class<BaseFeatureService>}> = [
      {
        code: SettingCode.uhomecpGlobalSearch,
        featureConstructor: UhomecpGlobalSearchFeatureService
      },
      {
        code: SettingCode.uhomecpMenuPreview,
        featureConstructor: UhomecpPreviewMenuFeatureService
      },
      {
        code: SettingCode.gitlabGlobalSearch,
        featureConstructor: GitlabGlobalSearchFeatureService
      },
      {
        code: SettingCode.gitlabFileViewer,
        featureConstructor: GitlabViewerFeatureService
      },
      {
        code: SettingCode.docleverGlobalSearch,
        featureConstructor: DocleverGlobalSearchFeatureService
      }
    ]

    // 保存功能编码和功能服务实例映射
    featureConstructorCodeConfigs.forEach(({code, featureConstructor}) => {
      const feature = featuresManager.findService(featureConstructor)
      featureCodeMap.set(code, feature)
    })

    // 同步功能状态
    const featureServiceSyncStatus = <T extends InstanceType<typeof BaseFeatureService>>(
      featureService: T | undefined,
      code: SettingCode
    ) => {
      // 当前编码设置
      const currentSetting = settings.value.find(setting => setting.code === code)
      if (!currentSetting || !featureService) return

      // 设置开关状态
      currentSetting.status = featureService.isFeatureOn

      // 打开功能
      featureService.on('turnOn', () => {
        console.log('turn on', code)
        currentSetting.status = true
      })

      // 关闭功能
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

/**
 * 切换功能设置开关
 */
function switchSettingStatus(setting: Setting) {
  setting.status = !setting.status
  handleStatusChange(setting.status, setting.code)
}

/**
 * 当功能设置开关状态变化时
 */
function handleStatusChange(status: boolean, code: SettingCode) {
  console.log(`${code}`, status, featureCodeMap.get(code))
  status ? featureCodeMap.get(code)?.turnOn() : featureCodeMap.get(code)?.turnOff()
}
</script>

<style scoped></style>
