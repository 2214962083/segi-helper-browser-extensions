<template>
  <div>
    <GlobalSearch v-model:active-tab-index="activeTabIndex" :tabs="searchTabs" :search-fn="searchFn" :item-height="64">
      <!-- 仓库卡片 -->
      <template #repository="{item}">
        <div class="w-full h-full flex flex-col justify-center" @click="goToUrl(item.web_url)">
          <div>{{ item.name }}</div>
          <div>{{ item.description }}</div>
        </div>
      </template>

      <!-- 文件卡片 -->
      <template #file="{item}">
        <div class="w-full h-full flex items-center" @click="goToUrl(item.fullUrl)">
          <DynamicIcon :name="item.iconName" :is-open="false" class="text-sm mr-2" />
          <span>{{ item.path }}</span>
        </div>
      </template>
    </GlobalSearch>
  </div>
</template>

<script setup lang="ts">
import {searchReposByName} from '@/common/apis/gitlab'
import {GlobalSearchFetchFn, GlobalSearchTab} from '@/common/components/GlobalSearch/GlobalSearch.types'
import GlobalSearch from '@/common/components/GlobalSearch/GlobalSearch.vue'
import {onMounted, ref} from 'vue'
import {useInit} from '../hooks/useInit'
import {GitlabFileTreeItem, GitlabService} from '../services'
import {win} from '../utils/common'
import DynamicIcon from './DynamicIcon'

// 当前 tab 索引
const activeTabIndex = ref(0)

// gitlab 当前仓库文件列表
const gitlabFiles = ref<GitlabFileTreeItem[]>([])

// 搜索类型 tabs
const searchTabs: GlobalSearchTab[] = [
  {
    label: '仓库',
    slotName: 'repository'
  },
  {
    label: '当前仓库文件',
    slotName: 'file'
  }
]

// 搜索函数
const searchFn: GlobalSearchFetchFn = async (keywords: string, tab: GlobalSearchTab) => {
  switch (tab.slotName) {
    case 'repository':
      return searchReposByName({name: keywords})
    case 'file':
      await initGitlabFiles()
      return gitlabFiles.value.filter(item => item.path.includes(keywords)) ?? []
    default:
      return []
  }
}

// 跳转到 url
function goToUrl(url: string) {
  const currentHost = location.host
  const targetHost = new URL(url).host

  if (currentHost === '192.168.1.6:9200' && targetHost === 'gitlab.uhomecp.com:9200') {
    url = url.replace('gitlab.uhomecp.com:9200', '192.168.1.6:9200')
  }

  win.location.href = url
}

// gitlab 服务
const gitlabService = GitlabService.getInstance()

/**
 * 初始化 gitlab 仓库文件列表
 */
const {init: initGitlabFiles} = useInit({
  initFn: async () => {
    // 初始化 gitlab service
    gitlabService.init()

    if (gitlabService.isRepoPage) {
      // 获取文件树
      const fileTree = await gitlabService.getAllFileTree()

      // 抹平文件树并存储
      gitlabFiles.value = gitlabService.flattenFileTree(fileTree)
    }
  }
})
onMounted(async () => {
  initGitlabFiles()
})
</script>
