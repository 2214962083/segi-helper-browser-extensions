/* eslint-disable @typescript-eslint/no-explicit-any */
export type {RemoteUhomecpMenu, UhomecpMenu, FindMenusOptions} from '@/entries/inject-script/src/utils/uhomecp-menu'

export interface SelectOption {
  label: string
  value: string
}

/**
 * 四格常用响应体
 */
export type UhomecpResWrapper<T = any> = {
  code: '0' | '1'
  message: string
  msg?: string
  data: T
}
