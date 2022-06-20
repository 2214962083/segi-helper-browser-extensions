import {fetchMenuList} from '@/common/apis/uhomecp'
import {win} from './common'
import {RemoteUhomecpMenu} from './uhomecp-menu'
import {debounce} from 'lodash-es'

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

// 菜单 res id 和菜单信息的映射表
let menuResIdMap: Map<string, RemoteUhomecpMenu>
export function usePreviewMenu() {
  /**
   * 获取 res id 对应的菜单映射表
   */
  const getMenuResIdMap = async () => {
    if (!menuResIdMap) {
      // 创建映射表
      menuResIdMap = new Map<string, RemoteUhomecpMenu>()

      // 递归设置映射表
      const setMap = (menus: RemoteUhomecpMenu[]) => {
        menus.map(menu => {
          menuResIdMap.set(String(menu.resId), menu)
          if (menu.child) {
            setMap(menu.child)
          }
        })
      }

      // 远程获取菜单列表
      const remoteMenus = await fetchMenuList()

      // 设置映射表
      setMap(remoteMenus)
    }
    return menuResIdMap
  }

  const {start: startPreview, stop: stopPReview} = usePreviewLink()

  const mouseEnterListener = debounce(async (e: MouseEvent) => {
    // hover 的 element
    const targetEl = e.target as HTMLElement | null

    // 菜单气泡弹窗 element
    const menuPopoverEl = win.document.querySelector('.popover-jp6l47')

    // 菜单星标收藏 element 的 class name
    const starElClass = 'star-q976x8'

    // 菜单名字的 element 的 class name
    const menuClass = 'ddd'

    if (!menuPopoverEl || !targetEl || !menuPopoverEl.contains(targetEl)) return

    // 菜单名字的父层 element
    const menuParent = targetEl.classList.contains(menuClass) ? targetEl.parentElement! : targetEl

    // 菜单星标收藏的 element
    const starEl = menuParent.querySelector(`.${starElClass}`)

    if (!starEl || !starEl.__vue__) return

    // hover 的菜单的 res id
    const menuResId = starEl.__vue__.resId ? String(starEl.__vue__.resId) : ''

    if (!menuResId) return

    // 菜单 res id 和菜单信息的映射表
    const idMap = await getMenuResIdMap()

    // hover 的 菜单对象
    const menu = idMap.get(menuResId)

    if (!menu) return

    // 创建 iframe 预览菜单
    startPreview(menu.url, e.x, e.y)

    // 监听停止预览
    function stopPreviewListener() {
      // 鼠标移出菜单名字的父层 element
      // 停止预览
      stopPReview()

      // 移除本次监听事件
      menuParent.removeEventListener('mouseleave', stopPreviewListener)
      menuParent.removeEventListener('mousedown', stopPreviewListener)
    }

    // 监听鼠标移出菜单名字的父层 element 的事件
    menuParent.addEventListener('mouseleave', stopPreviewListener)

    // 监听鼠标点击菜单名字的父层 element 的事件
    menuParent.addEventListener('mousedown', stopPreviewListener)
  }, 300)

  // 开启监听鼠标 hover 预览菜单功能
  const start = () => {
    win.document.body.addEventListener('mouseenter', mouseEnterListener, true)
  }

  // 关闭监听鼠标 hover 预览菜单功能
  const stop = () => {
    win.document.body.removeEventListener('mouseenter', mouseEnterListener, true)
  }

  return {
    start,
    stop
  }
}
