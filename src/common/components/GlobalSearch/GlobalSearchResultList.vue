<template>
  <div v-show="visible" ref="resultDom" class="global-search-result max-h-400px relative overflow-auto">
    <div class="global-search-listbox w-full">
      <div
        v-for="(item, i) in searchResult"
        :ref="setItemRef"
        :key="i"
        v-element-hover="() => setActive(i)"
        :class="[
          activeIndex === i ? 'global-search-listbox-item-active border-dark-800 bg-gray-100' : 'border-transparent'
        ]"
        :data-index="i"
        class="global-search-listbox-item py-12px px-16px border-l-2px w-full flex items-center justify-between h-16"
      >
        <slot :index="i" :item="item" :list="searchResult"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import {nextTick, onBeforeUpdate, onUpdated, ref} from 'vue'
import {vElementHover} from '@vueuse/components'
import {onKeyStroke} from '@vueuse/core'
import {sleep} from '@/common/utils/common'

const props = defineProps({
  /**
   * 当前列表是否展示
   */
  visible: {
    type: Boolean,
    default: false
  },

  /**
   * 搜索结果
   */
  searchResult: {
    type: Array,
    default: () => []
  }
})

// 搜索结果 dom
const resultDom = ref<HTMLElement>()

// 是否在按上下键移动
const isKeyMoving = ref(false)

// 搜索结果选项焦点索引
const activeIndex = ref(0)

let itemRefs: HTMLElement[] = []

const setItemRef = (el: any) => el && itemRefs.push(el as HTMLElement)

onBeforeUpdate(() => {
  itemRefs = []
})
onUpdated(() => {
  console.log(itemRefs)
})

async function scrollToActiveItem() {
  if (!props.visible) return
  if (!resultDom.value) return
  const activeDom = resultDom.value.querySelector<HTMLElement>('.global-search-listbox-item-active')
  if (!activeDom) return

  const currentResultDomScrollTop = resultDom.value.scrollTop
  const activeDomTop = activeDom.offsetTop
  const activeDomHeight = activeDom.offsetHeight
  const resultDomHeight = resultDom.value.offsetHeight

  isKeyMoving.value = true
  if (activeDomTop < currentResultDomScrollTop) {
    resultDom.value.scrollTop = activeDomTop
  } else if (activeDomTop + activeDomHeight > currentResultDomScrollTop + resultDomHeight) {
    resultDom.value.scrollTop = activeDomTop + activeDomHeight - resultDomHeight
  }
  await sleep(300)
  isKeyMoving.value = false
}

// 按上键，焦点向上移动
onKeyStroke(
  'ArrowUp',
  async e => {
    if (!props.visible) return true

    const subActiveIndex = activeIndex.value - 1
    activeIndex.value = subActiveIndex >= 0 ? subActiveIndex : props.searchResult.length - 1

    await nextTick()
    scrollToActiveItem()

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
    activeIndex.value = addActiveIndex < props.searchResult.length ? addActiveIndex : 0

    await nextTick()
    scrollToActiveItem()

    console.log(activeIndex.value)
    e.preventDefault()
  },
  {
    passive: true
  }
)

function setActive(index: number) {
  if (!props.visible) return
  if (isKeyMoving.value) return
  activeIndex.value = index
}
</script>

<style scoped></style>
