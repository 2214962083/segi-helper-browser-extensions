import {win} from './common'

/**
 * html 字符串转 xml 字符串
 * @param html html 字符串
 * @returns xml 规范的 xml 字符串
 */
export function htmStringToXml(html: string): string {
  const doc = win.document.implementation.createHTMLDocument('')
  doc.write(html)

  // You must manually set the xmlns if you intend to immediately serialize
  // the HTML document to a string as opposed to appending it to a
  // <foreignObject> in the DOM
  doc.documentElement.setAttribute('xmlns', doc.documentElement.namespaceURI ?? '')

  // Get well-formed markup
  const xml = new XMLSerializer().serializeToString(doc.body)
  return xml
}

export interface RenderHtmlStringToCanvasOptions {
  /**
   * html 字符串
   */
  html: string

  /**
   * 画布上下文
   */
  ctx: CanvasRenderingContext2D

  /**
   * 渲染区宽度
   */
  width: number

  /**
   * 渲染区高度
   */
  height: number

  /**
   * 绘画起点 x 轴坐标
   */
  x?: number

  /**
   * 绘画起点 y 轴坐标
   */
  y?: number
}

/**
 * 渲染 html 字符串到 canvas context 上
 */
export function renderHtmlStringToCanvas(options: RenderHtmlStringToCanvasOptions) {
  const {html, width, height, ctx, x = 0, y = 0} = options
  console.log('renderHtmlStringToCanvas', width, height)

  let xml = htmStringToXml(html)
  // eslint-disable-next-line no-useless-escape
  xml = xml.replace(/\#/g, '%23')

  const data =
    'data:image/svg+xml;charset=utf-8,' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    width +
    '" height="' +
    height +
    '">' +
    '<foreignObject width="100%" height="100%">' +
    xml +
    '</foreignObject>' +
    '</svg>'

  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, x, y)
  }
  img.src = data
}

export interface RenderElementToCanvasOptions {
  /**
   * 输入的 element
   */
  element: Element

  /**
   * 画布上下文
   */
  ctx: CanvasRenderingContext2D

  /**
   * 渲染区宽度
   */
  width: number

  /**
   * 渲染区高度
   */
  height: number

  /**
   * 绘画起点 x 轴坐标
   */
  x?: number

  /**
   * 绘画起点 y 轴坐标
   */
  y?: number
}

/**
 * 渲染 element 到 canvas context 上
 */
export function renderElementToCanvas(options: RenderElementToCanvasOptions) {
  const {element, width, height, ctx, x = 0, y = 0} = options

  return renderHtmlStringToCanvas({
    html: element.outerHTML,
    width,
    height,
    ctx,
    x,
    y
  })
}
