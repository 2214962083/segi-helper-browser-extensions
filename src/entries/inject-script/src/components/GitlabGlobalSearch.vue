<template>
  <div>
    <GlobalSearch v-model:active-tab-index="activeTabIndex" :tabs="searchTabs" :search-fn="searchFn">
      <template #repository="{item, index}"> 仓库{{ item }} </template>
      <template #file="{item, index}">
        <div class="w-full" @click="goToFile(item)">{{ item.path }}</div>
      </template>
    </GlobalSearch>
  </div>
</template>

<script setup lang="ts">
import {GlobalSearchFetchFn, GlobalSearchTab} from '@/common/components/GlobalSearch/GlobalSearch.types'
import GlobalSearch from '@/common/components/GlobalSearch/GlobalSearch.vue'
import {onMounted, ref} from 'vue'
import {GitlabFileTreeItem, GitlabService} from '../services'
import {win} from '../utils/common'

const activeTabIndex = ref(0)

// gitlab 当前仓库文件列表
const gitlabFiles = ref<GitlabFileTreeItem[]>([])

const isInitGitlabFiles = ref(false)
const isRequestingGitlabFiles = ref(false)

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

const searchFn: GlobalSearchFetchFn = async (keywords: string, tab: GlobalSearchTab) => {
  const result = Array.from(Array(30).keys())
  switch (tab.slotName) {
    case 'repository':
      return result
    case 'file':
      await initGitlabFiles()
      return gitlabFiles.value.filter(item => item.name.includes(keywords)) ?? []
    default:
      return result
  }
}

function goToFile(file: GitlabFileTreeItem) {
  console.log('goToFile', file)
  win.location.href = file.fullUrl
}

const gitlabService = GitlabService.getInstance()

/**
 * 初始化 gitlab 仓库文件列表
 */
async function initGitlabFiles() {
  if (isInitGitlabFiles.value) return
  if (isRequestingGitlabFiles.value) return

  isRequestingGitlabFiles.value = true

  // 初始化 gitlab service
  gitlabService.init()

  if (gitlabService.isRepoPage) {
    // 获取文件树
    const fileTree = await gitlabService.getAllFileTree()

    // 抹平文件树并存储
    gitlabFiles.value = gitlabService.flattenFileTree(fileTree)
  }

  isRequestingGitlabFiles.value = false
  isInitGitlabFiles.value = true
}

onMounted(async () => {
  initGitlabFiles()
})
</script>
