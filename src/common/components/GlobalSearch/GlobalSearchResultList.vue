slot
<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <div v-show="visible" v-bind="$attrs" ref="resultDom" class="global-search-result max-h-400px relative overflow-auto">
    <!-- 列表容器 -->
    <div v-bind="listContainerProps" class="global-search-listbox-container max-h-400px w-full">
      <!-- 列表包裹 -->
      <div v-bind="wrapperProps" class="global-search-listbox">
        <!-- 列表项 -->
        <div
          v-for="item in list"
          :key="item.index"
          v-element-hover="() => setActive(item.index)"
          :class="[
            activeIndex === item.index
              ? 'global-search-listbox-item-active border-dark-800 bg-gray-100'
              : 'border-transparent'
          ]"
          :data-index="item.index"
          class="global-search-listbox-item cursor-pointer py-12px px-16px border-l-2px w-full flex items-center justify-between"
          :style="{
            height: itemHeight + 'px'
          }"
        >
          <slot :index="item.index" :item="item.data" :list="searchResult"></slot>
        </div>
      </div>
    </div>
  </div>
  <!-- 加载中 -->
  <div
    v-show="visible && loading"
    v-loading="loading"
    class="global-search-loading h-400px w-full flex justify-center items-center"
  ></div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import {computed, nextTick, PropType, ref, toRefs} from 'vue'
import {vElementHover} from '@vueuse/components'
import {onKeyStroke, useEventListener, useVirtualList, watchDebounced} from '@vueuse/core'
import {sleep} from '@/common/utils/common'
import {GlobalSearchFetchFn, GlobalSearchTab} from './GlobalSearch.types'

const props = defineProps({
  /**
   * 当前列表是否展示
   */
  visible: {
    type: Boolean,
    default: false
  },

  tab: {
    type: Object as PropType<GlobalSearchTab>,
    default: () => ({})
  },

  /**
   * 搜索关键词
   */
  keywords: {
    type: String,
    default: ''
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
  }
})

// 搜索结果 dom
const resultDom = ref<HTMLElement>()

// 记录上一个操作是否是按上下键移动
// 用于锁定鼠标 hover 事件
const keyMoveInLastAction = ref(false)

// 搜索结果选项焦点索引
const activeIndex = ref(0)

// 搜索结果
const searchResult = ref<any[]>([])

// 是否搜索中
const loading = ref(false)

const {visible: propsVisible, keywords: propsKeywords} = toRefs(props)

// 虚拟列表
// see: https://vueuse.org/core/usevirtuallist/#usage
const {list, scrollTo, containerProps, wrapperProps} = useVirtualList(searchResult, {
  itemHeight: props.itemHeight
})

// volar 推导层次过深，直接 any 防止推导
const listContainerProps = containerProps as any

// 列表 dom
const listContainerDom = computed(() => containerProps.ref.value as HTMLElement | null)

// 滚动到指定的 item
async function scrollToActiveItem() {
  // 如果当前列表处于隐藏状态，什么也不干
  if (!props.visible) return
  if (!listContainerDom.value) return

  // hover 状态的焦点列表项
  const activeDom = listContainerDom.value.querySelector<HTMLElement>('.global-search-listbox-item-active')

  if (!activeDom) {
    if (activeIndex.value === 0) {
      // 如果是回到一开始的位置，需要调用虚拟列表的 scrollTo
      scrollTo(0)

      // 留点时间给滚动动画
      return await sleep(300)
    }

    return
  }

  // 列表容器当前滚动高度
  const currentListContainerDomScrollTop = listContainerDom.value.scrollTop

  // 列表容器高度
  const listContainerDomHeight = listContainerDom.value.offsetHeight

  // 当前焦点项滚动高度
  const activeDomTop = activeDom.offsetTop

  // 当前焦点项高度
  const activeDomHeight = activeDom.offsetHeight

  if (activeDomTop < currentListContainerDomScrollTop) {
    // 如果当前焦点项在滚动高度之上，则往上滚动
    listContainerDom.value.scrollTop = activeDomTop
  } else if (activeDomTop + activeDomHeight > currentListContainerDomScrollTop + listContainerDomHeight) {
    // 如果当前焦点项在滚动高度之下，则往下滚动
    listContainerDom.value.scrollTop = activeDomTop + activeDomHeight - listContainerDomHeight
  }

  // 留点时间给滚动动画
  return await sleep(500)
}

// 按 enter 键，模拟点击 element
onKeyStroke(
  'Enter',
  async e => {
    // 如果当前列表处于隐藏状态，什么也不干
    if (!props.visible) return true

    // hover 状态的焦点列表项
    const activeDom = listContainerDom.value?.querySelector<HTMLElement>('.global-search-listbox-item-active')
    if (!activeDom) return true

    // 焦点列表项第一个子项
    const activeDomFirstChild = activeDom.children?.[0] as HTMLElement

    // 按下 enter 键时模拟点击，触发子项的 click 事件
    activeDomFirstChild ? activeDomFirstChild.click() : activeDom.click()

    e.preventDefault()
  },
  {
    passive: true
  }
)

// 按上键，焦点向上移动
onKeyStroke(
  'ArrowUp',
  async e => {
    // 如果当前列表处于隐藏状态，什么也不干
    if (!props.visible) return true

    const subActiveIndex = activeIndex.value - 1
    activeIndex.value = subActiveIndex >= 0 ? subActiveIndex : searchResult.value.length - 1

    await nextTick()

    // 记录上一次操作是按键移动
    keyMoveInLastAction.value = true

    // 滚动到指定的 item
    await scrollToActiveItem()

    e.preventDefault()
  },
  {
    passive: true
  }
)

// 按下键，焦点向下移动
onKeyStroke(
  'ArrowDown',
  async e => {
    if (!props.visible) return true

    const addActiveIndex = activeIndex.value + 1
    activeIndex.value = addActiveIndex < searchResult.value.length ? addActiveIndex : 0

    await nextTick()

    // 记录上一次操作是按键移动
    keyMoveInLastAction.value = true

    // 滚动到指定的 item
    await scrollToActiveItem()

    e.preventDefault()
  },
  {
    passive: true
  }
)

useEventListener('mousemove', () => {
  // 抹除按键操作标记, 解锁鼠标 hover 事件
  keyMoveInLastAction.value = false
})

function setActive(index: number) {
  // 如果当前列表处于隐藏状态，什么也不干
  if (!props.visible) return

  //  如果上次操作是按键移动，则锁定鼠标 hover 事件
  if (keyMoveInLastAction.value) return

  // 设置焦点列表项索引
  activeIndex.value = index
}

/**
 * 当关键词变化时，搜索
 */
watchDebounced(
  [propsKeywords, propsVisible],
  async () => {
    const words = propsKeywords.value.trim()
    if (!words) {
      searchResult.value = []
      return
    }
    loading.value = true

    searchResult.value = await props.searchFn(words, props.tab).finally(() => {
      loading.value = false
    })
  },
  {
    deep: true,
    debounce: 300
  }
)
</script>

<style scoped></style>
