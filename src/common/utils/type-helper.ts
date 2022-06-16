/* eslint-disable @typescript-eslint/no-explicit-any */
export type {RemoteBetaMenu, BetaMenu, FindMenusOptions} from '@/entries/content-script/src/utils/searchMenu'

export interface SelectOption {
  label: string
  value: string
}

export type UhomeBetaResWrapper<T = any> = {
  code: '0' | '1'
  message: string
  msg?: string
  data: T
}
