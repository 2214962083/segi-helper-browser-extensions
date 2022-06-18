/* eslint-disable @typescript-eslint/no-explicit-any */
import {ref, Ref, UnwrapRef, watch} from 'vue'
import {useStorage} from '../utils/common'

export function useLocalRef<T extends object>(key: string, value: T): [T] extends [Ref] ? T : Ref<UnwrapRef<T>>

export function useLocalRef<T>(key: string, value: T): Ref<UnwrapRef<T>>

export function useLocalRef<T = any>(key: string): Ref<T | undefined>

/**
 * 实时存储值到 localStorage，主要用于 popup 页面，因为 popup 页面关掉就销毁了，不会保留状态
 * @param key 存储的 key
 * @param value 初始化的值
 */
export function useLocalRef(key: string, value?: any) {
  const [getVal, setVal] = useStorage(key, 'local')
  const storageVal = getVal()
  const val = ref(storageVal ?? value)

  watch(
    val,
    newVal => {
      setVal(newVal)
    },
    {
      deep: true
    }
  )

  return val
}
