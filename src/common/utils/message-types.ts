/* eslint-disable @typescript-eslint/no-explicit-any */
import {UhomecpService} from '@/entries/inject-script/src/services'
import {BrowserApiService} from '@/entries/background/src/services'
import type {ProtocolWithReturn} from 'webext-bridge'

export type GetProtocolFromFn<T extends (...args: any) => any> = ProtocolWithReturn<Parameters<T>, ReturnType<T>>

/**
 * message id
 */
export enum WebextMessageId {
  /**
   * 搜索 Uhomecp 菜单
   */
  searchUhomecpMenu = 'searchUhomecpMenu',

  /**
   * 打开 Uhomecp 菜单页面
   */
  openUhomecpMenuPage = 'openUhomecpMenuPage',

  /**
   * 聚焦 Uhomecp 菜单
   */
  focusUhomecpMenu = 'focusUhomecpMenu',

  /**
   * 获取扩展资源 url
   */
  getExtensionResourceUrl = 'getExtensionResourceUrl',

  /**
   * 在 window context 执行脚本
   */
  runScriptInWindow = 'runScriptInWindow'
}

export interface WebextMessage {
  /**
   * inject script 消息 id
   */
  [WebextMessageId.searchUhomecpMenu]: GetProtocolFromFn<UhomecpService['searchUhomecpMenu']>
  [WebextMessageId.openUhomecpMenuPage]: GetProtocolFromFn<UhomecpService['openUhomecpMenuPage']>
  [WebextMessageId.focusUhomecpMenu]: GetProtocolFromFn<UhomecpService['focusUhomecpMenu']>

  /**
   * background 消息 id
   */
  [WebextMessageId.getExtensionResourceUrl]: GetProtocolFromFn<BrowserApiService['getExtensionResourceUrl']>
  [WebextMessageId.runScriptInWindow]: GetProtocolFromFn<BrowserApiService['runScriptInWindow']>
}
