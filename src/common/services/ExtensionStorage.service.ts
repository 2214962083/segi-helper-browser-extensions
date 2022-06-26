/* eslint-disable @typescript-eslint/no-explicit-any */
import browser from 'webextension-polyfill'
import {sendMessageToCurrentTab} from '../utils/common'

export type ExtensionStorageType = 'local' | 'sync'

/**
 * 扩展存储服务兼容类
 * 浏览去端没有 browser.storage.local 之类的 api，于是有了这个类
 * 在浏览器环境，通过 message 掉用 background 的 browser api
 */
export class ExtensionStoragePolyfill implements browser.Storage.StorageArea {
  private _type: ExtensionStorageType

  constructor(type: ExtensionStorageType) {
    this._type = type
  }

  private _getIsBrowser() {
    return !browser?.storage?.local && Boolean(window)
  }

  private _getMessageId(methodName: string) {
    return `browser.storage.${this._type}.${methodName}`
  }

  async get(keys?: null | string | string[] | Record<string, any>): Promise<Record<string, any>> {
    if (!this._getIsBrowser()) return await browser.storage[this._type].get(keys)

    const messageId = this._getMessageId('get')
    return await sendMessageToCurrentTab(messageId, [keys!], 'background')
  }

  async set(items: Record<string, any>): Promise<void> {
    if (!this._getIsBrowser()) return await browser.storage[this._type].set(items)

    const messageId = this._getMessageId('set')
    await sendMessageToCurrentTab(messageId, [items], 'background')
    return
  }

  async remove(keys: string | string[]): Promise<void> {
    if (!this._getIsBrowser()) return await browser.storage[this._type].remove(keys)

    const messageId = this._getMessageId('remove')
    await sendMessageToCurrentTab(messageId, [keys], 'background')
    return
  }

  async clear(): Promise<void> {
    if (!this._getIsBrowser()) return await browser.storage[this._type].clear()

    const messageId = this._getMessageId('clear')
    await sendMessageToCurrentTab(messageId, [], 'background')
    return
  }
}

export interface ExtensionStorageServiceOptions {
  /**
   * sync 为浏览器内部同步到远程
   * local 为浏览器扩展本地存储
   */
  type?: ExtensionStorageType

  /**
   * 存储 key 前缀
   */
  namespace?: string
}

/**
 * 浏览器扩展存储服务
 */
export class ExtensionStorageService {
  static _instance: ExtensionStorageService
  static getInstance = () =>
    ExtensionStorageService._instance || (ExtensionStorageService._instance = new ExtensionStorageService())

  private _storage: browser.Storage.StorageArea
  private _namespace: string

  constructor(options?: ExtensionStorageServiceOptions) {
    const {type = 'local', namespace = ''} = options || {}

    this._namespace = namespace
    this._storage = type === 'local' ? new ExtensionStoragePolyfill('local') : new ExtensionStoragePolyfill('sync')

    console.log('ExtensionStorageService', this)
  }

  private _getKey = (key: string) => `${this._namespace}_${key}`

  async getItem<T = any>(key: string): Promise<T | null> {
    const _key = this._getKey(key)
    const result = await this._storage.get(_key)
    return result[_key] ? JSON.parse(result[_key]) : null
  }

  async setItem<T = any>(key: string, value: T): Promise<void> {
    const _key = this._getKey(key)
    return await this._storage.set({[_key]: JSON.stringify(value)})
  }

  async removeItem(key: string): Promise<void> {
    const _key = this._getKey(key)
    return await this._storage.remove(_key)
  }

  async clear(): Promise<void> {
    return await this._storage.clear()
  }
}
