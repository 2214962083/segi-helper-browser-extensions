/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {JsonValue} from 'type-fest'
import Stoor from 'stoor'
import {STORAGE_NAMESPACE} from './constants'
import {DataTypeKey, Destination, GetDataType, GetReturnType, parseEndpoint, sendMessage} from 'webext-bridge'
import browser from 'webextension-polyfill'
import {ElNotification} from 'element-plus'
import 'element-plus/theme-chalk/el-notification.css' // element-plus 的样式

/**
 * 删掉对象中空的 key
 * @param obj 要过滤的对象
 */
export function deleteNilKeys<T extends Record<string, any>>(obj: T): T {
  return Object.entries(obj).reduce((acc, [key, value]: [keyof T, any]) => {
    if (Boolean(value) || value === 0) {
      acc[key] = value
    }
    return acc
  }, {} as T) as T
}

/**
 * 提示错误信息
 * @param errorMsg 错误信息
 */
export function toastError(error: string | Error) {
  const errorMsg = typeof error === 'string' ? error : error.message || '未知错误'
  console.error('toastError', errorMsg)
  return ElNotification({
    message: errorMsg,
    type: 'error'
  })
}

/**
 * 对象是否存在这个 key
 * @param obj 对象
 * @param key 对象的 key
 */
export function hasOwnKey<T extends object, K extends keyof T>(obj: T, key: K): obj is T & Record<K, T[K]> {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

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
    // stoor bug， 他的 getValue 判断相反了
    const finalTimeout = timeout === null || timeout === undefined ? null : -1 * timeout
    return storage?.set(cacheKey, val, finalTimeout)
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
  const tab = (await browser?.tabs?.query?.({active: true, currentWindow: true}))?.[0]
  const _dest = typeof destination === 'string' ? parseEndpoint(destination) : destination
  // @ts-ignore
  _dest.tabId = (tab?.id ?? _dest.tabId) || null
  // console.log(messageID, _dest)
  return sendMessage(messageID, data, _dest)
}

/**
 * 获取 app 渲染节点
 * @param className 类名
 */
export function useAppContainer(className?: string) {
  const win = top || window
  const appContainer = win.document.createElement('div')
  if (className) appContainer.className = className
  win.document.body.appendChild(appContainer)

  const remove = () => {
    win.document.body.removeChild(appContainer)
  }

  return {
    appContainer,
    removeAppContainer: remove
  }
}

/**
 * 获取文本比特大小
 * @param text 文本
 * @returns 比特率，1024代表 1kb，1024*1024 代表 1mb
 */
export function getTextBytes(text: string) {
  return new TextEncoder().encode(text)?.length ?? 0
}

/**
 * 复制文本到剪贴板
 * @param text 文本
 * @param success 成功回调
 * @param fail 失败回调
 */
export function copyToClipboard(text: string, success?: () => void, fail?: () => void) {
  const win = top || window
  if (!win) return
  // @ts-ignore
  if (win.clipboardData && win.clipboardData.setData) {
    // Internet Explorer 特定的代码路径，以防止在对话框可见时显示文本区域。
    // @ts-ignore
    win.clipboardData.setData('Text', text)
    success?.()
    return
  } else if (document?.queryCommandSupported?.('copy')) {
    const textarea = document.createElement('textarea')
    textarea.textContent = text
    textarea.style.position = 'fixed' // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand?.('copy') // Security exception may be thrown by some browsers.
      success?.()
      return
    } catch (ex) {
      toastError('复制失败，请手动复制')
      fail?.()
      win.prompt?.('按 Ctrl/Cmd+C 复制', text)
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}
