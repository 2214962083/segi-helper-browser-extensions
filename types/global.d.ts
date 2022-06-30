/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    /**
     * beta 环境打开 tab 页
     */
    openPortalMenu?: (url: string, name: string) => void

    /**
     * 注入 css 文件
     */
    segiHelperExtensionLoadStyle: () => void

    /**
     * 移除注入的 css 文件
     */
    segiHelperExtensionRemoveStyle?: () => void
  }

  interface Element {
    /**
     * vue2 挂载在 element 上的实例
     */
    __vue__?: Record<string, any>
  }
}

export {}
