/* eslint-disable @typescript-eslint/no-explicit-any */
import browser from 'webextension-polyfill'

export interface ExtensionStorageServiceOptions {
  /**
   * sync 为浏览器内部同步到远程
   * local 为浏览器扩展本地存储
   */
  type?: 'local' | 'sync'

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
    this._storage = type === 'local' ? browser.storage.local : browser.storage.sync

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
