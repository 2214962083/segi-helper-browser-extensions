<template>
  <div
    class="global-search-container fixed z-99999999 flex items-start justify-center w-full inset-0 px-4 pb-4 pt-14vh"
  >
    <div
      class="global-search-body max-w-600px w-full bg-white text-gray-800 rounded-8px overflow-hidden shadow-normal pointer-events-auto"
    >
      <el-input v-model="keywords" class="global-search-input" autocomplete></el-input>
      <div ref="resultDom" class="global-search-result max-h-400px relative overflow-auto">
        <div class="global-search-listbox w-full">
          <div
            v-for="(item, i) in searchResult"
            :key="i"
            v-element-hover="() => setActive(i)"
            :class="[
              activeIndex === i ? 'global-search-listbox-item-active border-dark-800 bg-gray-100' : 'border-transparent'
            ]"
            class="global-search-listbox-item py-12px px-16px border-l-2px w-full flex items-center justify-between h-16"
          >
            {{ i }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {nextTick, ref} from 'vue'
import {vElementHover} from '@vueuse/components'
import {onKeyStroke} from '@vueuse/core'
import {sleep} from '@/common/utils/common'

const resultDom = ref<HTMLElement>()

const keywords = ref('')
const activeIndex = ref(0)
const searchResult = ref(Array(10).map((_, i) => i))

// 是否在按上下键
const isKeyMoving = ref(false)

async function scrollToActiveItem() {
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
    const subActiveIndex = activeIndex.value - 1
    activeIndex.value = subActiveIndex >= 0 ? subActiveIndex : searchResult.value.length - 1

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
    const addActiveIndex = activeIndex.value + 1
    activeIndex.value = addActiveIndex < searchResult.value.length ? addActiveIndex : 0

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
  if (isKeyMoving.value) return
  activeIndex.value = index
}
</script>

<style>
.global-search-input .el-input__wrapper {
  padding: 12px;
  border: none;
  box-shadow: none;
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
