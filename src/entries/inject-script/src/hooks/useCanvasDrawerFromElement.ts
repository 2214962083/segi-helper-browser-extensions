import {renderElementToCanvas} from '../utils/canvas-utils'
import {win} from '../utils/common'

export interface UseCanvasDrawerFromElementOptions {
  /**
   * 输入的 element
   */
  element?: Element

  /**
   * 渲染区宽度
   */
  width: number

  /**
   * 渲染区高度
   */
  height: number
}

/**
 * 渲染 element 到 canvas 上
 * 主要用于缩小预览 element
 */
export function useCanvasDrawerFromElement(options: UseCanvasDrawerFromElementOptions) {
  const {element, width, height} = options

  const canvas = win.document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const setCanvasSize = (width: number, height: number) => {
    canvas.width = width
    canvas.height = height
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
  }

  setCanvasSize(width, height)

  const update = () =>
    ctx &&
    element &&
    renderElementToCanvas({
      element,
      width: canvas.width,
      height: canvas.height,
      ctx,
      y: 0,
      x: 0
    })

  update()

  return {
    canvas,
    setCanvasSize,
    update
  }
}
