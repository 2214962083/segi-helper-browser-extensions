/* eslint-disable @typescript-eslint/no-explicit-any */
import {UhomeBetaService} from '@/entries/content-script/src/services'
import type {ProtocolWithReturn} from 'webext-bridge'

export type GetProtocolFromFn<T extends (...args: any) => any> = ProtocolWithReturn<Parameters<T>, ReturnType<T>>

/**
 * message id
 */
export enum WebextMessageId {
  /**
   * 搜索beta菜单
   */
  searchBetaMenu = 'searchBetaMenu'
}

export interface WebextMessage {
  [WebextMessageId.searchBetaMenu]: GetProtocolFromFn<UhomeBetaService['searchBetaMenu']>
}
