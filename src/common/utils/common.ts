/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {JsonValue} from 'type-fest'
import Stoor from 'stoor'
import {STORAGE_NAMESPACE} from './constants'
import {DataTypeKey, Destination, GetDataType, GetReturnType, parseEndpoint, sendMessage} from 'webext-bridge'
import browser from 'webextension-polyfill'

/**
 * 睡眠函数
 * @param ms 毫秒
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 字符串、数字或对象转成哈希字符串
 * @param val 字符串、数字或对象
 * @returns 哈希字符串
 */
export function valToHash(val: string | number | Object) {
  const str = typeof val === 'string' ? val : JSON.stringify(val)
  let hash = 0
  if (str.length === 0) return 'hash' + hash
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return 'hash' + hash
}

/**
 * 缓存
 */
const validStorageType = ['local', 'session'] as const
type StorageType = typeof validStorageType[number]
const storageMap = new Map<StorageType, Stoor>()
export function useStorage(key: string | number | object, type: StorageType | null | undefined = 'session') {
  let storage = type && validStorageType.includes(type) ? storageMap.get(type)! : undefined
  if (!storage && type && validStorageType.includes(type)) {
    storage = new Stoor({namespace: STORAGE_NAMESPACE, storage: type})
    storageMap.set(type, storage)
  }

  const cacheKey = valToHash(key)

  const setValue = <T = any>(val: T, timeout: number | null = null) => {
    return storage?.set(cacheKey, val, timeout)
  }

  const getValue = <T = any>(defaultValue?: T): T | undefined => {
    return storage?.get(cacheKey, defaultValue)
  }

  const removeKey = () => {
    return storage?.remove(cacheKey)
  }

  const clear = () => {
    return storage?.clear()
  }

  return [getValue, setValue, removeKey, clear] as const
}

/**
 * 改写 sendMessage，默认发送给当前 tab
 * @param messageID messageId
 * @param data 数据
 * @param destination 发送目的地信息
 * @returns 响应结果
 */
export async function sendMessageToCurrentTab<ReturnType extends JsonValue, K extends DataTypeKey | string>(
  messageID: K,
  data: GetDataType<K, JsonValue>,
  destination: Destination = 'background'
): Promise<GetReturnType<K, ReturnType>> {
  const tab = (await browser.tabs.query({active: true, currentWindow: true}))[0]
  const _dest = typeof destination === 'string' ? parseEndpoint(destination) : destination
  // @ts-ignore
  _dest.tabId = (tab.id ?? _dest.tabId) || null
  console.log(_dest)
  return sendMessage(messageID, data, _dest)
}
