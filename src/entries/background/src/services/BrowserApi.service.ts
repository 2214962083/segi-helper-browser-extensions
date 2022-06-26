/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {WebextMessageId} from '@/common/utils/message-types'
import {OnMessage} from '@/common/utils/decorators'
import browser from 'webextension-polyfill'
import {onMessage} from 'webext-bridge'

/**
 * browser api 服务
 * 由于浏览器环境访问不了很多扩展独有的 api
 * 于是构建 message 让浏览器环境通过 message 调用 browser api
 */
export class BrowserApiService {
  static _instance: BrowserApiService
  static getInstance = () => BrowserApiService._instance || (BrowserApiService._instance = new BrowserApiService())

  /**
   * 获取扩展资源 url
   */
  @OnMessage(WebextMessageId.getExtensionResourceUrl)
  getExtensionResourceUrl(path: string): string {
    return browser.runtime.getURL(path)
  }
}

// 存储方法，由于 browser.storage.local 是 proxy ，用 object.keys 获取不了方法名称，所以列举出来
const browserStorageMethods: Array<keyof browser.Storage.StorageArea> = ['get', 'set', 'remove', 'clear']

// 监听 message 调用 browser.storage.local 上的方法
browserStorageMethods.map(_methodName => {
  const methodName = _methodName as keyof browser.Storage.StorageArea
  const messageId = `browser.storage.local.${methodName}`
  const method = browser.storage.local[methodName]
  const target = browser.storage.local
  onMessage(messageId, ({data}) => {
    // @ts-ignore
    return method.call(target, ...data)
  })
})

// 监听 message 调用 browser.storage.sync 上的方法
browserStorageMethods.map(_methodName => {
  const methodName = _methodName as keyof browser.Storage.StorageArea
  const messageId = `browser.storage.sync.${methodName}`
  const method = browser.storage.sync[methodName]
  const target = browser.storage.sync
  onMessage(messageId, ({data}) => {
    // @ts-ignore
    return method.call(target, ...data)
  })
})

console.log('BrowserApiService init')

export const browserApiService = BrowserApiService.getInstance()
