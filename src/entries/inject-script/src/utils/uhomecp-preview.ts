import {win} from './common'

export interface PreviewMenuOptions {
  el: HTMLElement
  url: string
  scale?: number
  width?: number
}
export function previewMenu(options: PreviewMenuOptions) {
  const {el, url, scale, width} = options

  const previewIframe = win.document.createElement('iframe')

  Object.assign(previewIframe.style, {
    display: 'none',
    transformOrigin: '0% 0%',
    borderRadius: '10px',
    overflow: 'hidden',
    border: 'none',
    boxShadow: '2px 4px 8px rgba(0, 0, 0, 0.3)',
    position: 'fixed',
    zIndex: '9999999'
  })

  document.body.appendChild(previewIframe)

  el.addEventListener('mouseenter', e => {
    const windowWidth = win.document.documentElement.clientWidth
    const windowHeight = win.document.documentElement.clientHeight
    const finalWidth = width ? width : windowWidth * (scale || 0.5)
    const finalHeight = (finalWidth / windowWidth) * windowHeight
    console.log('mouseenter', e)
    previewIframe.src = url
    Object.assign(previewIframe.style, {
      display: 'block',
      width: finalWidth + 'px',
      height: finalHeight + 'px',
      top: e.y + 'px',
      left: e.x + 'px'
    })
  })
  el.addEventListener('mouseleave', e => {
    console.log('mouseleave', e)
    Object.assign(previewIframe.style, {
      display: 'none'
    })
  })
}
