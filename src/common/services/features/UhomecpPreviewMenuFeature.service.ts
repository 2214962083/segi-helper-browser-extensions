import {fetchMenuList} from '@/common/apis/uhomecp'
import {debounce} from 'lodash-es'
import {win} from '@/entries/inject-script/src/utils/common'
import {RemoteUhomecpMenu} from '@/entries/inject-script/src/utils/uhomecp-menu'
import {usePreviewLink} from '@/entries/inject-script/src/utils/preview-link'
import {BaseFeatureService, BaseFeatureServiceOptions, FeatureService, FeatureTask} from './BaseFeature.service'
import {UHOMECP_PREVIEW_MENU_STORAGE_NAMESPACE} from '@/common/utils/constants'

export type UhomecpPreviewMenuFeatureServiceOptions = Omit<BaseFeatureServiceOptions, 'storageKeyPrefix'>

/**
 * Uhomecp 预览菜单功能服务
 */
export class UhomecpPreviewMenuFeatureService extends BaseFeatureService implements FeatureService {
  menuResIdMap?: Map<string, RemoteUhomecpMenu>

  constructor(options?: UhomecpPreviewMenuFeatureServiceOptions) {
    super({
      storageKeyPrefix: UHOMECP_PREVIEW_MENU_STORAGE_NAMESPACE,
      defaultIncludeSites: ['192.168.1.11:10060', 'beta.uhomecp.com'],
      ...options
    })
  }

  async init(): Promise<void> {
    this.addMountedScriptTask(this.previewMenuTask())

    await super.init()

    console.log('UhomecpPreviewMenuFeatureService init', this)
  }

  /**
   * 获取 res id 对应的菜单映射表
   */
  async getMenuResIdMap() {
    if (!this.menuResIdMap) {
      // 创建映射表
      this.menuResIdMap = new Map<string, RemoteUhomecpMenu>()

      // 递归设置映射表
      const setMap = (menus: RemoteUhomecpMenu[]) => {
        menus.map(menu => {
          this.menuResIdMap!.set(String(menu.resId), menu)
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
    return this.menuResIdMap
  }

  /**
   * 预览菜单功能
   */
  previewMenuTask(): FeatureTask {
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

      // 判断目标是否是菜单 element
      const isMenuEl = (el: HTMLElement | null) =>
        (el && el.classList.contains('cp') && el.querySelector('span.ddd')) ||
        (el && el.classList.contains('ddd') && el.parentElement?.classList.contains('cp'))

      if (!menuPopoverEl || !targetEl || !menuPopoverEl.contains(targetEl) || !isMenuEl(targetEl)) return stopPReview()

      // 菜单名字的父层 element
      const menuParent = targetEl.classList.contains(menuClass) ? targetEl.parentElement! : targetEl

      // 菜单星标收藏的 element
      const starEl = menuParent.querySelector(`.${starElClass}`)

      if (!starEl || !starEl.__vue__) return

      // hover 的菜单的 res id
      const menuResId = starEl.__vue__.resId ? String(starEl.__vue__.resId) : ''

      if (!menuResId) return

      // 菜单 res id 和菜单信息的映射表
      const idMap = await this.getMenuResIdMap()

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
    }, 500)

    // 开启监听鼠标 hover 预览菜单功能
    const start = () => {
      win.document.body.addEventListener('mouseenter', mouseEnterListener, true)
    }

    // 关闭监听鼠标 hover 预览菜单功能
    const stop = () => {
      win.document.body.removeEventListener('mouseenter', mouseEnterListener, true)
    }

    return {start, stop}
  }
}
