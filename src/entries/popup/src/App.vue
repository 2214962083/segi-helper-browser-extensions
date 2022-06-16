<template>
  <div w-150 h-150 p-4 flex flex-col rounded border border-gray relative overflow-hidden>
    <div absolute top-0 left-0 z-10 w-full>
      <!-- 顶部菜单 -->
      <MyMenu :default-active="menuActive" :menus="menus"></MyMenu>
    </div>
    <div class="blank" w-full h-10></div>
    <div>
      <!-- 搜索框 -->
      <el-input v-model="searchKeywords" placeholder="请输入搜索关键词" :suffix-icon="Search">
        <template #prepend>
          <el-select v-model="searchType" placeholder="搜索方式" style="width: 115px">
            <el-option v-for="option in searchTypes" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </template>
      </el-input>

      <!-- 列表 -->
      <div mt-4 flex flex-col w-full>
        <div w-full p-4 border border-gray rounded h-10 flex items-center>共享单据>>共享单据模板>>共享单据模板列表</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {watchDebounced} from '@vueuse/core'
import MyMenu from '@/common/components/menu.vue'
import {Menu} from '@/common/components/menu.type'
import {SelectOption} from '@/common/utils/type-helper'
import {Search} from '@element-plus/icons-vue'
import {sendMessage} from 'webext-bridge'
import {WebextMessageId} from '@/common/utils/message-types'
import browser from 'webextension-polyfill'

const menuActive = ref('searchBetaMenu')
const menus = ref<Menu[]>([
  {
    key: 'searchBetaMenu',
    title: '搜索 beta 菜单'
  },
  {
    key: 'collectBetaMenu',
    title: 'beta 收藏菜单'
  },
  {
    key: 'settings',
    title: '设置'
  },
  {
    key: 'about',
    title: '关于'
  }
])

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

async function search() {
  console.log('search')
  const tab = (await browser.tabs.query({active: true, currentWindow: true}))[0]
  return sendMessage(
    WebextMessageId.searchBetaMenu,
    [
      {
        url: searchType.value === 'url' ? searchKeywords.value : '',
        name: searchType.value === 'menuName' ? searchKeywords.value : ''
      }
    ],
    {context: 'content-script', tabId: tab.id!}
  )
}

watchDebounced(
  [searchKeywords, searchType],
  () => {
    search().then(res => {
      console.log('搜索结果', res)
    })
  },
  {debounce: 500, maxWait: 1000}
)
</script>

<style scoped></style>
