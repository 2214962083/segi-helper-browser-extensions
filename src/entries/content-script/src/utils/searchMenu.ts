/**
 * 远程获取的菜单格式
 */
export interface RemoteBetaMenu {
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
  child?: RemoteBetaMenu[]

  /**
   * 内部补充 key
   * 菜单路径名称
   */
  pathName?: string
}

/**
 * find menu return 的菜单格式
 */
export interface BetaMenu {
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

  /**
   * 跳转菜单页面函数
   */
  go: () => void

  /**
   * 聚焦菜单函数
   */
  focus: () => void
}

/**
 * 查找菜单参数
 */
export interface FindMenusOptions {
  /**
   * 菜单名称，支持正则，支持模糊查询
   */
  name: string

  /**
   * 单路径，支持正则，支持模糊查询
   */
  url: string

  /**
   * 是否返回菜单的完整信息，默认 false
   */
  showMoreInfo?: boolean

  /**
   * 查完是否自动打印结果， 默认为 false
   */
  autoLog?: boolean

  /**
   * 是否自动打开最后一个结果的菜单页面，默认为 false
   */
  autoGoLast?: boolean

  /**
   * 是否自动聚焦最后一个结果的菜单，默认为 true
   */
  autoFocusLast?: boolean
}

/**
 * 根据菜单名称或 url 查找菜单，返回菜单数组
 */
export async function findMenus({
  name,
  url,
  showMoreInfo = false,
  autoLog = true,
  autoGoLast = false,
  autoFocusLast = true
}: FindMenusOptions) {
  interface PrivateFindMenusOptions {
    name: string
    url: string
    showMoreInfo?: boolean
    _list?: RemoteBetaMenu[]
    _prefixPathName?: string
  }

  /**
   * 根据菜单名称或 url 查找菜单，返回菜单数组
   */
  async function privateFindMenus({
    name,
    url,
    showMoreInfo = false,
    _list,
    _prefixPathName = ''
  }: PrivateFindMenusOptions) {
    type PrivateMenu = BetaMenu & RemoteBetaMenu

    // 获取远程菜单
    const fetchUrl = `/authc-restapi/portal/menuList?_t=${Date.now()}`
    const fetchMenuList = (): Promise<RemoteBetaMenu[]> =>
      fetch(fetchUrl)
        .then(res => res.json())
        .then(res => res.data.menuList.child)

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
        const _menu = showMoreInfo ? (menu as PrivateMenu) : ({name: menuName, url: menuUrl} as PrivateMenu)
        _menu.pathName = _prefixPathName + menuName
        _menu.go = () => top?.openPortalMenu?.(_menu.url, _menu.name)
        _menu.focus = () => focusMenu(_menu.pathName)
        findResult.push(_menu)
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
  if (result.length) {
    const lastMenu = result[result.length - 1]
    if (autoGoLast) lastMenu.go()
    if (autoFocusLast) lastMenu.focus()
  }
  return result
}

// 根据路径名称聚焦菜单
export function focusMenu(pathName: string) {
  const menuNames = pathName.split(' >> ')

  // 添加焦点颜色
  const addFocusStyle = (el: HTMLElement) =>
    el && Object.assign(el.style, {color: '#0084ff', border: '1px solid #0084ff'})

  const [firstMenuName, secondMenuName, thirdMenuName] = menuNames
  if (menuNames.length === 0 || !firstMenuName) return

  // 一级菜单聚焦
  const firstMenuElm = top?.document.querySelector<HTMLElement>(`.first-mrg8 span[title="${firstMenuName}"]`)
  if (!firstMenuElm) return
  if (menuNames.length === 1) return addFocusStyle(firstMenuElm)
  firstMenuElm.click()

  // 二级菜单聚焦
  const secondMenuElm = top?.document.querySelector<HTMLElement>(`.second-mrg8 span[title="${secondMenuName}"]`)
  if (!secondMenuElm) return
  if (menuNames.length === 2) return addFocusStyle(secondMenuElm)
  secondMenuElm.click()

  // 三级菜单聚焦
  // 因为这个渲染有延迟，所以在 setTimeout 里执行
  setTimeout(() => {
    const thirdMenuElm = Array.from(top?.document.querySelectorAll<HTMLElement>(`.third-name-knpy`) ?? []).find(el => {
      return el.textContent === thirdMenuName
    })
    if (!thirdMenuElm) return
    if (menuNames.length === 3) return addFocusStyle(thirdMenuElm)
  }, 100)
}
