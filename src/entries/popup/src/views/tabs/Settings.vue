<template>
  <div class="setting-list w-full h-full flex flex-col">
    <!-- 设置选项 -->
    <div v-for="(setting, i) in settings" :key="i" class="setting-item h-10 h-full flex items-center justify-between">
      <!-- 设置标题 -->
      <div class="setting-item-left">
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
import {ExtensionStorageService} from '@/common/services/ExtensionStorage.service'
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

// 设置存储的 key，请勿修改，否则别人会丢失数据
const settingStorageKey = 'setting'

// 扩展存储服务
const extensionStorageService = ExtensionStorageService.getInstance()

// 设置 json 配置
const settings = ref<Setting[]>([
  {
    title: 'uhomecp beta 和 11 全局搜索',
    code: SettingCode.uhomecpGlobalSearch,
    status: true
  },
  {
    title: 'uhomecp beta 和 11 菜单预览',
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

const {init: initSettings} = useInit({
  initFn: async () => {
    const result = await extensionStorageService.getItem(settingStorageKey)
    if (result) settings.value = result
  }
})

initSettings()
onMounted(() => {
  initSettings()
})

/**
 * 保存设置
 */
function saveSetting() {
  extensionStorageService.setItem(settingStorageKey, settings.value)
}

function handleStatusChange(status: boolean, code: SettingCode) {
  switch (code) {
    case SettingCode.uhomecpGlobalSearch:
      break
    case SettingCode.uhomecpMenuPreview:
      break
    case SettingCode.gitlabGlobalSearch:
      break
    case SettingCode.gitlabFileViewer:
      break
  }

  saveSetting()
}
</script>

<style scoped></style>
