<template>
  <div
    v-show="visible"
    class="global-search-container fixed z-99999999 flex items-start justify-center w-full inset-0 px-4 pb-4 pt-14vh"
  >
    <!-- 主体框 -->
    <div
      ref="searchPanelDom"
      class="global-search-body max-w-600px w-full bg-white text-gray-800 rounded-8px overflow-hidden shadow-normal pointer-events-auto"
    >
      <!-- 输入框 -->
      <el-input
        ref="searchInputRef"
        v-model="keywords"
        class="global-search-input"
        autofocus
        autocomplete="autocomplete"
      ></el-input>

      <!-- tabs -->
      <div class="global-search-tabs w-full flex items-center">
        <div
          v-for="(tab, tabIndex) in tabs"
          :key="tabIndex"
          class="global-search-tab cursor-pointer flex justify-center items-center !px-4 !py-2 border-b-2px hover:bg-gray-100"
          :class="[tabIndex === activeTabIndex ? 'text-gray-800 border-gray-800' : 'text-gray-400 border-transparent']"
          @click="emit('update:activeTabIndex', tabIndex)"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-for="(tab, tabIndex) in tabs" v-show="tabIndex === activeTabIndex" :key="tabIndex">
        <GlobalSearchResultList
          :visible="tabIndex === activeTabIndex"
          :search-fn="searchFn"
          :tab="tab"
          :keywords="keywords"
          :item-height="itemHeight"
          :item-class="itemClass"
        >
          <template #default="{item, index, list}">
            <slot :name="tab.slotName" :tab="tab" :item="item" :index="index" :list="list"></slot>
          </template>
        </GlobalSearchResultList>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import {PropType, ref, watch} from 'vue'
import {onClickOutside, useMagicKeys} from '@vueuse/core'
import {ElInput} from 'element-plus'
import GlobalSearchResultList from './GlobalSearchResultList.vue'
import {GlobalSearchFetchFn, GlobalSearchTab} from './GlobalSearch.types'

const props = defineProps({
  /**
   * tab 页数组配置
   */
  tabs: {
    type: Array as PropType<GlobalSearchTab[]>,
    default: () => []
  },

  /**
   * 当前所在的 tab
   */
  activeTabIndex: {
    type: Number,
    default: 0
  },

  /**
   * 搜索函数
   */
  searchFn: {
    type: Function as PropType<GlobalSearchFetchFn>,
    default: () => () => Promise.resolve([])
  },

  /**
   * 列表项高度
   */
  itemHeight: {
    type: Number,
    default: 64
  },

  /**
   * 列表项类名
   */
  itemClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (name: 'update:activeTabIndex', index: number): void
}>()

// 搜索面板 dom
const searchPanelDom = ref<HTMLElement>()

// 搜索框 vue 实例
const searchInputRef = ref<InstanceType<typeof ElInput>>()

// 是否显示当前搜索面板
const visible = ref(false)

// 搜索关键字
const keywords = ref('')

// 监听键盘组合键
// see: https://vueuse.org/core/useMagicKeys/
const {Ctrl_k, Tab, Shift_Tab} = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 'k') e.preventDefault()
    if (e.key === 'Tab') visible.value && e.preventDefault()
  }
})

/**
 * 点击搜索面板以外的区域关闭搜索面板
 */
onClickOutside(searchPanelDom, () => {
  visible.value = false
})

/**
 * ctrl + k 控制搜索框显隐
 */
watch(Ctrl_k, val => {
  if (!val) return
  visible.value = !visible.value
})

/**
 * 往左走一个 tab
 */
function toLeftTab() {
  let index = props.activeTabIndex - 1
  index = index < 0 ? props.tabs.length - 1 : index
  emit('update:activeTabIndex', index)
}

/**
 * 往右走一个 tab
 */
function toRightTab() {
  let index = props.activeTabIndex + 1
  index = index >= props.tabs.length ? 0 : index
  emit('update:activeTabIndex', index)
}

/**
 * shift + tab 向左切换 tab
 */
watch([Shift_Tab], () => {
  if (!Shift_Tab.value) return
  toLeftTab()
})

/**
 * tab 向右切换 tab
 */
watch([Tab], () => {
  if (!Tab.value) return
  !Shift_Tab.value && toRightTab()
})

/**
 * 当搜索框出现时，自动聚焦
 */
watch(visible, val => {
  if (val) searchInputRef.value?.focus()
})
</script>

<style>
.global-search-input .el-input__wrapper {
  padding: 12px;
  border: none !important;
  box-shadow: none !important;
}
.global-search-input input {
  width: 100%;
  padding: 1.2rem 0.5rem;
  font-size: 16px;
  background-color: #eee;
  border: none;
  border-radius: 6px;
  outline: none;
}
</style>
