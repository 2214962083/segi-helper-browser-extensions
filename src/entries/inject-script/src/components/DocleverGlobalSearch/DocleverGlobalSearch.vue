<template>
  <div>
    <GlobalSearch
      v-model:active-tab-index="activeTabIndex"
      :tabs="searchTabs"
      :search-fn="searchFn"
      :item-height="100"
      item-class="border-b border-b-gray-100"
    >
      <!-- 根据接口 url 搜索结果卡片 -->
      <template #apiUrl="{item}">
        <DocleverCard :doclever="item" @click="openApiPage(item)"></DocleverCard>
      </template>

      <!-- 根据接口名称搜索结果 卡片 -->
      <template #apiName="{item}">
        <DocleverCard :doclever="item" @click="openApiPage(item)"></DocleverCard>
      </template>
    </GlobalSearch>
  </div>
</template>

<script setup lang="ts">
import {GlobalSearchFetchFn, GlobalSearchTab} from '@/common/components/GlobalSearch/GlobalSearch.types'
import GlobalSearch from '@/common/components/GlobalSearch/GlobalSearch.vue'
import DocleverCard from './DocleverCard.vue'
import {onMounted, ref} from 'vue'
import {DocleverService, DocleverTreeItem} from '../../services/Doclever.service'
import {useInit} from '../../hooks/useInit'
import {useLocalRef} from '@/common/hooks/useLocalRef'
import {win} from '../../utils/common'

// 当前 tab 索引
const activeTabIndex = ref(0)

// 搜索类型 tabs
const searchTabs: GlobalSearchTab[] = [
  {
    label: '接口 url',
    slotName: 'apiUrl'
  },
  {
    label: '接口名称',
    slotName: 'apiName'
  }
]

const apiList = useLocalRef<DocleverTreeItem[]>('doclever_apiList', [], 1000 * 60 * 60 * 24)
const docleverService = DocleverService.getInstance()

const {init: initApiList} = useInit({
  initFn: async () => {
    if (apiList.value.length) return
    apiList.value = await docleverService.getApiList()
    console.log('apiList', apiList.value)
  }
})

initApiList()
onMounted(() => {
  initApiList()
})

// 搜索函数
const searchFn: GlobalSearchFetchFn = async (keywords: string, tab: GlobalSearchTab) => {
  await initApiList()
  switch (tab.slotName) {
    case 'apiName':
      return apiList.value.filter(item => item.fullPathName.includes(keywords)) ?? []
    case 'apiUrl':
      return apiList.value.filter(item => item.apiUrl.includes(keywords)) ?? []
    default:
      return []
  }
}

/**
 * 打开接口对应的页面
 */
function openApiPage(docleverItem: DocleverTreeItem) {
  console.log('docleverItem', docleverItem)
  win.open(`http://192.168.1.11:9090/html/web/controller/share/share.html#${docleverItem._id}`, '_blank')
}
</script>
