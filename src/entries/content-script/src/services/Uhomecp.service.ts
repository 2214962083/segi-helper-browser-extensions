import {WebextMessageId} from '@/common/utils/message-types'
import {OnMessage} from '@/common/utils/decorators'
import {findMenus, FindMenusOptions, openMenuPage, focusMenu} from '../utils/uhomecp-menu'

export class UhomecpService {
  static _instance: UhomecpService
  static getInstance = () => UhomecpService._instance || (UhomecpService._instance = new UhomecpService())

  /**
   * 搜索 uhomecp 菜单
   */
  @OnMessage(WebextMessageId.searchUhomecpMenu)
  searchUhomecpMenu(options: FindMenusOptions) {
    return findMenus(options)
  }

  /**
   * 打开 uhomecp 菜单页面
   */
  @OnMessage(WebextMessageId.openUhomecpMenuPage)
  openUhomecpMenuPage(options: {url: string; name: string}) {
    return openMenuPage(options.url, options.name)
  }

  /**
   * 聚焦 uhomecp 菜单
   */
  @OnMessage(WebextMessageId.focusUhomecpMenu)
  focusUhomecpMenu(options: {pathName: string}) {
    return focusMenu(options.pathName)
  }
}

console.log('UhomecpService init')

export const uhomeUhomecpService = UhomecpService.getInstance()
