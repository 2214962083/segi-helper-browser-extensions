declare global {
  interface Window {
    /**
     * beta 环境打开 tab 页
     */
    openPortalMenu?: (url: string, name: string) => void
  }
}

export {}
