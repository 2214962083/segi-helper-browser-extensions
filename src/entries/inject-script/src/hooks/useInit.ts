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

  async function init() {
    if (isIniting.value || isInit.value) return

    isIniting.value = true

    try {
      await initFn()
      isInit.value = true
    } finally {
      isIniting.value = false
    }
  }

  return {
    isInit,
    isIniting,
    init
  }
}
