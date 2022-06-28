import {fetchMenuList} from '@/common/apis/uhomecp'
import {sleep, valToHash} from '@/common/utils/common'
import {win} from './common'

/**
 * 远程获取的菜单格式
 */
export interface RemoteUhomecpMenu {
  orderNo: string
  openMode: string
  appPanelUrl: string
  customResName: string
  icon: string
  type: string
  resId: string
  url: string
  operDescId: string
  target: string
  resName: string
  parentResId: string
  resCode: string
  child?: RemoteUhomecpMenu[]

  /**
   * 内部补充 key
   * 菜单路径名称
   */
  pathName?: string
}

/**
 * find menu return 的菜单格式
 */
export interface UhomecpMenu {
  /**
   * 菜单 id
   */
  id: string

  /**
   * 菜单名称
   */
  name: string

  /**
   * 菜单跳转的页面 url
   */
  url: string

  /**
   * 菜单路径名称
   */
  pathName: string
}

/**
 * 查找菜单参数
 */
export interface FindMenusOptions {
  /**
   * 菜单名称，支持正则，支持模糊查询
   */
  name?: string

  /**
   * 单路径，支持正则，支持模糊查询
   */
  url?: string

  /**
   * 是否返回菜单的完整信息，默认 true
   */
  showMoreInfo?: boolean

  /**
   * 查完是否自动打印结果， 默认为 true
   */
  autoLog?: boolean
}

/**
 * 根据菜单名称或 url 查找菜单，返回菜单数组
 */
export async function findMenus({name, url, showMoreInfo = true, autoLog = true}: FindMenusOptions) {
  interface PrivateFindMenusOptions {
    name?: string
    url?: string
    showMoreInfo?: boolean
    _list?: RemoteUhomecpMenu[]
    _prefixPathName?: string
  }

  /**
   * 根据菜单名称或 url 查找菜单，返回菜单数组
   */
  async function privateFindMenus({
    name,
    url,
    showMoreInfo = true,
    _list,
    _prefixPathName = ''
  }: PrivateFindMenusOptions) {
    type PrivateMenu = UhomecpMenu & RemoteUhomecpMenu

    // 获取远程菜单
    const menuList = _list ? _list : await fetchMenuList()
    const findResult: PrivateMenu[] = []

    const promises = menuList.map(async menu => {
      let cond = false
      const menuName = menu.customResName || menu.resName
      const menuUrl = menu.url
      const menuChildren = menu.child

      if (name) cond = Boolean(menuName.match(name))
      if (url) cond = Boolean(menuUrl.match(url))
      if (cond) {
        // 找到了菜单，处理一下数据
        const _menu = {
          ...(showMoreInfo ? (menu as PrivateMenu) : {}),
          id: menu.resId,
          name: menuName,
          url: menuUrl
        } as PrivateMenu
        _menu.pathName = _prefixPathName + menuName

        if (!_menu.id) _menu.id = valToHash(_menu.pathName) // 如果没有 id，则生成一个
        if (_menu.url !== '#') {
          // url 为 # 时, 该菜单非最终级别菜单,没有 url ,不给予展示
          findResult.push(_menu)
        }
      }

      if (menuChildren && menuChildren.length) {
        // 递归查找子菜单
        const childrenFindResult = await privateFindMenus({
          name,
          url,
          _list: menuChildren,
          _prefixPathName: _prefixPathName + menuName + ' >> '
        })
        findResult.push(...childrenFindResult)
      }
      return null
    })
    await Promise.allSettled(promises)
    return findResult
  }

  const result = await privateFindMenus({name, url, showMoreInfo})
  if (autoLog) console.log('查找结果:', result)
  return result
}

// 在新窗口打开菜单
export async function openMenuPage(url: string, name: string) {
  console.log('打开菜单页面:', url, name, win, win.openPortalMenu)
  return win.openPortalMenu?.(url, name)
}

// 根据路径名称聚焦菜单
export async function focusMenu(pathName: string) {
  const menuNames = pathName.split(' >> ')

  // 左侧菜单滚动指定 elm
  const scrollMenuElm = (menuElm: HTMLElement) => {
    const menuListElm = win.document.querySelector<HTMLElement>('.menus-ntk96q')
    if (!menuListElm) return
    menuListElm.scrollTo({
      top: menuElm.offsetTop - 15, // - menuListElm.offsetTop,
      behavior: 'smooth'
    })
  }

  // 关闭已展开的菜单
  const closeMenu = async () => {
    // 随便点击一个位置关闭菜单弹窗
    win.document.querySelector<HTMLElement>('.tabs-nwmp0v')?.click()

    // 点击侧栏正在展开的菜单以收起菜单
    const activeMenuElm = win.document.querySelector<HTMLElement>('.first-wrap-mrg8.active-i80b > .ddd')
    activeMenuElm?.click()
    await sleep(activeMenuElm ? 500 : 100)
  }

  // 添加焦点颜色
  const addFocusStyle = (el: HTMLElement) =>
    el && Object.assign(el.style, {color: '#0084ff', border: '1px solid #0084ff'})

  const [firstMenuName, secondMenuName, thirdMenuName, fourthMenuName] = menuNames
  if (menuNames.length === 0 || !firstMenuName) return

  await closeMenu()

  // 一级菜单聚焦
  const firstMenuElm = win.document.querySelector<HTMLElement>(`.first-mrg8 span[title="${firstMenuName}"]`)
  if (!firstMenuElm) return

  // 滚动到指定位置
  scrollMenuElm(firstMenuElm)
  await sleep(100)

  if (menuNames.length === 1) return addFocusStyle(firstMenuElm)
  firstMenuElm.click()
  await sleep(300)

  // 二级菜单聚焦
  const secondMenuElm = win.document.querySelector<HTMLElement>(`.second-mrg8 span[title="${secondMenuName}"]`)
  if (!secondMenuElm) return
  if (menuNames.length === 2) return addFocusStyle(secondMenuElm)
  secondMenuElm.click()
  await sleep(300)

  // 三级菜单聚焦
  if (menuNames.length === 3) {
    const maybeThirdMenuElms = Array.from(win.document.querySelectorAll<HTMLElement>(`span.ddd`) ?? []) // 三级菜单
    const thirdMenuElms = maybeThirdMenuElms.filter(el => el.textContent === thirdMenuName)
    if (!thirdMenuElms.length) return
    console.log('找到三级菜单:', thirdMenuElms)
    thirdMenuElms.map(el => addFocusStyle(el))
  }

  // 四级菜单聚焦
  if (menuNames.length === 4) {
    const maybeFourthMenuElms = Array.from(win.document.querySelectorAll<HTMLElement>(`span.ddd`) ?? []) // 四级菜单
    const fourthMenuElms = maybeFourthMenuElms.filter(el => el.textContent === fourthMenuName) // 可能存在多个，有些隐藏有些显示
    if (!fourthMenuElms.length) return
    console.log('找到四级菜单:', fourthMenuElms)
    fourthMenuElms.map(el => addFocusStyle(el))
  }
}
