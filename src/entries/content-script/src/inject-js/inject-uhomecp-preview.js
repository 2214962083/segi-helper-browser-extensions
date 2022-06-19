/**
 * 本文件不走编译，将以字符串形式注入到页面中
 * 请勿引入任何其他文件
 */

function previewMenu(el, url) {
  const previewIframe = top.document.createElement('iframe')
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
    const windowWidth = top.document.documentElement.clientWidth
    const windowHeight = top.document.documentElement.clientHeight
    const scale = 0.5
    console.log('mouseenter', e)
    previewIframe.src = url
    Object.assign(previewIframe.style, {
      display: 'block',
      width: windowWidth * scale + 'px',
      height: windowHeight * scale + 'px',
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
window.previewMenu = previewMenu
console.log('inject-uhomecp-preview.js', window)
