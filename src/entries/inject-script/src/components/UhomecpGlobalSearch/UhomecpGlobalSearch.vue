<template>
  <div>
    <GlobalSearch v-model:active-tab-index="activeTabIndex" :tabs="searchTabs" :search-fn="searchFn" :item-height="64">
      <!-- 根据菜单 iframe url 搜索结果卡片 -->
      <template #menuName="{item}">
        <UhomecpMenuCard :menu="item" @click="openUhomecpMenuPage(item.url, item.name)"></UhomecpMenuCard>
      </template>

      <!-- 根据菜单名称搜索结果 卡片 -->
      <template #menuIframeUrl="{item}">
        <UhomecpMenuCard :menu="item" @click="openUhomecpMenuPage(item.url, item.name)"></UhomecpMenuCard>
      </template>

      <!-- 直达 iframe 链接窗口卡片 -->
      <template #openIframeByUrl="{item}">
        <div class="w-full h-full flex items-center" @click="openUhomecpMenuPage(item)">
          {{ item }}
        </div>
      </template>
    </GlobalSearch>
  </div>
</template>

<script setup lang="ts">
import {GlobalSearchFetchFn, GlobalSearchTab} from '@/common/components/GlobalSearch/GlobalSearch.types'
import GlobalSearch from '@/common/components/GlobalSearch/GlobalSearch.vue'
import UhomecpMenuCard from './UhomecpMenuCard.vue'
import {Ref, ref} from 'vue'
import {findMenus, openMenuPage} from '../../utils/uhomecp-menu'
import {useLocalStorage} from '@vueuse/core'

// 当前 tab 索引
const activeTabIndex = ref(0)

// 搜索类型 tabs
const searchTabs: GlobalSearchTab[] = [
  {
    label: '菜单名称',
    slotName: 'menuName'
  },
  {
    label: 'iframe url',
    slotName: 'menuIframeUrl'
  },
  {
    label: 'iframe 链接直达',
    slotName: 'openIframeByUrl'
  }
]

// iframe 链接直达历史
const openIframeByUrlHistory = useLocalStorage('openIframeByUrlHistory', []) as Ref<string[]>

// 搜索函数
const searchFn: GlobalSearchFetchFn = async (keywords: string, tab: GlobalSearchTab) => {
  switch (tab.slotName) {
    case 'menuName':
      return (await findMenus({name: keywords})) ?? []
    case 'menuIframeUrl':
      return (await findMenus({url: keywords})) ?? []
    case 'openIframeByUrl':
      return [keywords, ...openIframeByUrlHistory.value]
    default:
      return []
  }
}

/**
 * 打开该菜单对应的页面
 */
function openUhomecpMenuPage(url: string, name?: string) {
  openIframeByUrlHistory.value.push(url)
  return openMenuPage(url, name!)
}
</script>
