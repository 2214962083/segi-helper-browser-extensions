import {WebextMessageId} from '@/common/utils/message-types'
import {OnMessage} from '@/common/utils/decorators'
import {findMenus, FindMenusOptions} from '../utils/searchMenu'

export class UhomeBetaService {
  static _instance: UhomeBetaService
  static getInstance = () => UhomeBetaService._instance || (UhomeBetaService._instance = new UhomeBetaService())

  /**
   * 搜索 beta 菜单
   */
  @OnMessage(WebextMessageId.searchBetaMenu)
  searchBetaMenu(options: FindMenusOptions) {
    return findMenus(options)
  }
}

console.log('UhomeBetaService loaded')

export const uhomeBetaService = UhomeBetaService.getInstance()
