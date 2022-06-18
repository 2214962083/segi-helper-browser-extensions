<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-shrink-0">
      <!-- 搜索框 -->
      <el-input v-model="searchKeywords" placeholder="请输入搜索关键词" :suffix-icon="Search">
        <template #prepend>
          <el-select v-model="searchType" placeholder="搜索方式" class="w-28">
            <el-option v-for="option in searchTypes" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </template>
      </el-input>
    </div>

    <!-- 列表 -->
    <div class="mt-2 pb-6 overflow-y-scroll flex-1 w-full">
      <UhomecpMenuCard
        v-for="(resultMenu, index) in searchResultMenus"
        :key="index"
        :menu="resultMenu"
        :show-border="index !== searchResultMenus.length - 1"
      ></UhomecpMenuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import {watchDebounced} from '@vueuse/core'
import {UhomecpMenu, SelectOption} from '@/common/utils/type-helper'
import UhomecpMenuCard from '@/common/components/UhomecpMenuCard.vue'
import {Search} from '@element-plus/icons-vue'
import {WebextMessageId} from '@/common/utils/message-types'
import {sendMessageToCurrentTab, toastError} from '@/common/utils/common'
import {useLocalRef} from '@/common/hooks/useLocalRef'

const searchKeywords = useLocalRef('SearchMenu_searchKeywords', '')
const searchType = useLocalRef('SearchMenu_searchType', 'url')
const searchTypes = useLocalRef<SelectOption[]>('SearchMenu_searchTypes', [
  {
    value: 'url',
    label: 'iframe url'
  },
  {
    value: 'menuName',
    label: '菜单名称'
  }
])
const searchResultMenus = useLocalRef<UhomecpMenu[]>('SearchMenu_searchResultMenus', [])

async function search() {
  console.log('search')
  searchResultMenus.value = []
  searchResultMenus.value = await sendMessageToCurrentTab(
    WebextMessageId.searchUhomecpMenu,
    [
      {
        url: searchType.value === 'url' ? searchKeywords.value : '',
        name: searchType.value === 'menuName' ? searchKeywords.value : ''
      }
    ],
    'content-script'
  ).catch(err => toastError(err) && [])

  return searchResultMenus.value
}

watchDebounced(
  [searchKeywords, searchType],
  () => {
    search()
  },
  {debounce: 500, maxWait: 1000}
)
</script>

<style scoped></style>
