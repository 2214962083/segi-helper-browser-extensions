/* eslint-disable @typescript-eslint/no-explicit-any */
import {WebextMessageId} from '@/common/utils/message-types'
import {OnMessage} from '@/common/utils/decorators'
import browser from 'webextension-polyfill'

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

console.log('BrowserApiService init')

export const browserApiService = BrowserApiService.getInstance()
