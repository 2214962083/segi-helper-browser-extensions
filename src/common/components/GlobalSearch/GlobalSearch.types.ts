/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 全局搜索 tab 的结构
 */
export interface GlobalSearchTab {
  /**
   * tab 的标题
   */
  label: string

  /**
   * tab 的插槽名称
   */
  slotName: string
}

/**
 * 搜索函数,需要返回一个 promise 列表结果
 */
export type GlobalSearchFetchFn<T extends any[] = any[]> = (keywords: string, tab: GlobalSearchTab) => Promise<T>
