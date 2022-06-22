/**
 * 获取字体尺寸
 * @param text 文字
 * @param fontStyle 字体样式，默认获取 document.body 的字体样式
 */
export function getTextSize(
  text: string,
  fontStyle: {
    size?: number
    weight?: CSSStyleDeclaration['fontWeight']
    family?: CSSStyleDeclaration['fontFamily']
  } = {}
) {
  const win = top || window
  const bodyStyle = win.getComputedStyle(document.body)
  const {
    size = bodyStyle?.fontSize ?? 14,
    weight = bodyStyle?.fontWeight ?? 'normal',
    family = bodyStyle?.fontFamily ?? 'Microsoft YaHei'
  } = fontStyle

  const canvas = win.document.createElement('canvas')
  const context = canvas.getContext('2d')!

  context.font = `${weight} ${size}px ${family}`

  const metrics = context.measureText(text)
  const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

  return {
    width: metrics.width ?? 0,
    height: actualHeight ?? 0
  }
}
