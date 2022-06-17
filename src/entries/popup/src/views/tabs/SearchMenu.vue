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
      <div
        v-for="(resultMenu, index) in searchResultMenus"
        :key="index"
        class="w-full p-3 border-gray-200 flex items-center justify-between"
        :class="{
          'border-b': index !== searchResultMenus.length - 1
        }"
      >
        <div>
          {{ resultMenu.pathName }}
        </div>
        <div class="flex">
          <el-button size="small" type="primary" @click="openUhomecpMenuPage(resultMenu)">打开</el-button>
          <el-button class="ml-2" size="small" @click="focusUhomecpMenu(resultMenu)">聚焦</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {watchDebounced} from '@vueuse/core'
import {UhomecpMenu, SelectOption} from '@/common/utils/type-helper'
import {Search} from '@element-plus/icons-vue'
import {WebextMessageId} from '@/common/utils/message-types'
import {sendMessageToCurrentTab} from '@/common/utils/common'

const searchKeywords = ref('')
const searchType = ref('url')
const searchTypes = ref<SelectOption[]>([
  {
    value: 'url',
    label: 'iframe url'
  },
  {
    value: 'menuName',
    label: '菜单名称'
  }
])
const searchResultMenus = ref<UhomecpMenu[]>([])

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
  )
  return searchResultMenus.value
}

async function openUhomecpMenuPage(menu: UhomecpMenu) {
  console.log('openUhomecpMenuPage', menu)
  await sendMessageToCurrentTab(
    WebextMessageId.openUhomecpMenuPage,
    [
      {
        url: menu.url,
        name: menu.name
      }
    ],
    'content-script'
  )
}

async function focusUhomecpMenu(menu: UhomecpMenu) {
  console.log('focusUhomecpMenu', menu)
  await sendMessageToCurrentTab(
    WebextMessageId.focusUhomecpMenu,
    [
      {
        pathName: menu.pathName
      }
    ],
    'content-script'
  )
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
