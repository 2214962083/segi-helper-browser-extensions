/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    /**
     * beta 环境打开 tab 页
     */
    openPortalMenu?: (url: string, name: string) => void
  }

  interface Element {
    /**
     * vue2 挂载在 element 上的实例
     */
    __vue__?: Record<string, any>
  }
}

export {}
