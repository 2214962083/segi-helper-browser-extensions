/* eslint-disable @typescript-eslint/no-explicit-any */
import {UhomecpService} from '@/entries/content-script/src/services'
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
  focusUhomecpMenu = 'focusUhomecpMenu'
}

export interface WebextMessage {
  [WebextMessageId.searchUhomecpMenu]: GetProtocolFromFn<UhomecpService['searchUhomecpMenu']>
  [WebextMessageId.openUhomecpMenuPage]: GetProtocolFromFn<UhomecpService['openUhomecpMenuPage']>
  [WebextMessageId.focusUhomecpMenu]: GetProtocolFromFn<UhomecpService['focusUhomecpMenu']>
}
