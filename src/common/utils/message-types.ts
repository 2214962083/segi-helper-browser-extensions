/* eslint-disable @typescript-eslint/no-explicit-any */
import {BrowserApiService} from '@/entries/background/src/services'
import type {ProtocolWithReturn} from 'webext-bridge'

export type GetProtocolFromFn<T extends (...args: any) => any> = ProtocolWithReturn<Parameters<T>, ReturnType<T>>

/**
 * message id
 */
export enum WebextMessageId {
  /**
   * 获取扩展资源 url
   */
  getExtensionResourceUrl = 'getExtensionResourceUrl'
}

export interface WebextMessage {
  /**
   * background 消息 id
   */
  [WebextMessageId.getExtensionResourceUrl]: GetProtocolFromFn<BrowserApiService['getExtensionResourceUrl']>
}
