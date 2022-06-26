import {win} from './common'

export interface UsePreviewLinkOptions {
  /**
   * 预览区相对于 window 的缩放倍数，默认 0.5
   */
  scale?: number

  /**
   * 预览区的宽度
   */
  width?: number
}

/**
 * 预览链接
 */
export function usePreviewLink(options?: UsePreviewLinkOptions) {
  const {scale, width} = options || {}

  // 创建预览 iframe
  const previewIframe = win.document.createElement('iframe')

  Object.assign(previewIframe.style, {
    display: 'none',
    backgroundColor: '#fff',
    transformOrigin: '0% 0%',
    borderRadius: '10px',
    overflow: 'hidden',
    border: 'none',
    boxShadow: '2px 4px 8px rgba(0, 0, 0, 0.3)',
    position: 'fixed',
    zIndex: '9999999'
  })

  document.body.appendChild(previewIframe)

  // 开启预览
  const start = (url: string, x: number, y: number) => {
    const windowWidth = win.document.documentElement.clientWidth
    const windowHeight = win.document.documentElement.clientHeight
    const finalWidth = width ? width : windowWidth * (scale || 0.5)
    const finalHeight = (finalWidth / windowWidth) * windowHeight
    previewIframe.src = url

    // 预览窗口展示在鼠标下方
    const showInBottom: Partial<CSSStyleDeclaration> = {
      top: y + 'px',
      left: x + 'px',
      right: 'auto',
      bottom: 'auto'
    }

    // 预览窗口展示在鼠标上方
    const showInTop: Partial<CSSStyleDeclaration> = {
      top: y - finalHeight + 'px',
      left: x + 'px',
      right: 'auto',
      bottom: 'auto'
    }

    // 预览窗口最终展示位置
    const finalShowPosition = y + finalHeight > windowHeight ? showInTop : showInBottom

    Object.assign(previewIframe.style, {
      display: 'block',
      width: finalWidth + 'px',
      height: finalHeight + 'px',
      ...finalShowPosition
    })
  }

  // 关闭预览
  const stop = () =>
    Object.assign(previewIframe.style, {
      display: 'none'
    })

  return {
    start,
    stop
  }
}
