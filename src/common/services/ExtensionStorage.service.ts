/* eslint-disable @typescript-eslint/no-explicit-any */
import browser from 'webextension-polyfill'

export interface ExtensionStorageServiceOptions {
  /**
   * sync 为浏览器内部同步到远程
   * local 为浏览器扩展本地存储
   */
  type: 'local' | 'sync'
}

/**
 * 浏览器扩展存储服务
 */
export class ExtensionStorageService {
  static _instance: ExtensionStorageService
  static getInstance = () =>
    ExtensionStorageService._instance || (ExtensionStorageService._instance = new ExtensionStorageService())

  private storage: browser.Storage.StorageArea

  constructor(options?: ExtensionStorageServiceOptions) {
    const {type = 'local'} = options || {}
    this.storage = type === 'local' ? browser.storage.local : browser.storage.sync
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    const result = await this.storage.get(key)
    return JSON.parse(result[key]) ?? null
  }

  async setItem<T = any>(key: string, value: T): Promise<void> {
    return await this.storage.set({[key]: JSON.stringify(value)})
  }

  async removeItem(key: string): Promise<void> {
    return await this.storage.remove(key)
  }

  async clear(): Promise<void> {
    return await this.storage.clear()
  }
}
