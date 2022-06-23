export const win = top || window

export function getElementStyle(element: Element, styleName: string) {
  return win.getComputedStyle(element, null).getPropertyValue(styleName)
}
