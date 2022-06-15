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
import MyMenu from '@/common/components/menu.vue'
import {Menu} from '@/common/components/menu.type'
import {SelectOption} from '@/common/utils/type-helper'
import {Search} from '@element-plus/icons-vue'

const menuActive = ref('2-2')
const menus = ref<Menu[]>([
  {
    key: '1',
    title: '首页'
  },
  {
    key: '2',
    title: '设置',
    children: [
      {
        key: '2-1',
        title: '设置1'
      },
      {
        key: '2-2',
        title: '设置2'
      }
    ]
  },
  {
    key: '3',
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
</script>

<style scoped></style>
