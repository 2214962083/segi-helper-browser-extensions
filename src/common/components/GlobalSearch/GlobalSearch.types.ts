/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GlobalSearchTab {
  label: string
  slotName: string
}

export type GlobalSearchFetchFn<T extends any[] = any[]> = (keywords: string, tab: GlobalSearchTab) => Promise<T>
