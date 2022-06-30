/* eslint-disable @typescript-eslint/no-explicit-any */
import {ref} from 'vue'

export interface UseInitOptions {
  initFn: () => Promise<void> | void
}

/**
 * 只初始化一次
 */
export function useInit(options: UseInitOptions) {
  const {initFn} = options

  // 是否已经加载了
  const isInit = ref(false)

  // 是否正在加载
  const isIniting = ref(false)

  let promise: Promise<any> | null | void = null

  async function init() {
    if (isIniting.value || isInit.value) return promise

    isIniting.value = true

    try {
      if (!promise) {
        promise = initFn()
        await promise
      }
      isInit.value = true
    } finally {
      isIniting.value = false
      promise = null
    }
  }

  return {
    isInit,
    isIniting,
    init
  }
}
