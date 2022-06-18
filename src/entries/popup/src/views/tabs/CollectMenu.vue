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
import {SelectOption} from '@/common/utils/type-helper'
import UhomecpMenuCard from '@/common/components/UhomecpMenuCard.vue'
import {Search} from '@element-plus/icons-vue'
import {useLocalRef} from '@/common/hooks/useLocalRef'
import {CollectMenu, CollectMenuService} from '../../services/CollectMenu.service'

const searchKeywords = useLocalRef('CollectMenu_searchKeywords', '')
const searchType = useLocalRef('CollectMenu_searchType', 'url')
const searchTypes = useLocalRef<SelectOption[]>('CollectMenu_searchTypes', [
  {
    value: 'url',
    label: 'iframe url'
  },
  {
    value: 'menuName',
    label: '菜单名称'
  }
])
const searchResultMenus = useLocalRef<CollectMenu[]>('CollectMenu_searchResultMenus', [])

/**
 * 加载收藏菜单
 */
const co = CollectMenuService.getInstance()
async function loadMenus() {
  await co.init()
  searchResultMenus.value = co.getAllMenus()
}

loadMenus()

async function search() {
  console.log('search')
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
