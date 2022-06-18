import {ExtensionStorageService} from '@/common/services/ExtensionStorage.service'
import {valToHash} from '@/common/utils/common'
import {UhomecpMenu} from '@/common/utils/type-helper'
import {SetRequired} from 'type-fest'

export interface CollectMenu extends UhomecpMenu {
  isCustom: boolean
}

/**
 * 收藏菜单服务
 */
export class CollectMenuService {
  static _instance: CollectMenuService
  static getInstance = () => CollectMenuService._instance || (CollectMenuService._instance = new CollectMenuService())

  static _key = 'collectMenu'
  private _data: CollectMenu[] = []
  private _isInit = false

  async init() {
    if (this._isInit) return
    await this.loadData()
    this._isInit = true
  }

  /**
   * 从扩展存储中获取数据
   */
  async loadData() {
    this._data = (await ExtensionStorageService._instance.getItem(CollectMenuService._key)) ?? []
  }

  /**
   * 保存数据到扩展存储中
   */
  async saveData() {
    await ExtensionStorageService._instance.setItem(CollectMenuService._key, this._data)
  }

  /**
   * 是否存在菜单
   * @param menu 菜单信息
   */
  async hasMenu(menu: CollectMenu) {
    return this._data.some(item => item.id === menu.id)
  }

  /**
   * 添加收藏菜单
   * @param menu 菜单信息
   */
  async addMenu(menu: SetRequired<Partial<CollectMenu>, 'name' | 'url'>): Promise<boolean> {
    const buildMenu = {...menu} as CollectMenu

    // 如果不存在 id 则生成一个
    buildMenu.id = buildMenu.id || `generateId_${valToHash(buildMenu.isCustom ? buildMenu.name : buildMenu.pathName)}`

    // 如果不存在 pathName 则使用菜单名称作为路径名称
    buildMenu.pathName = buildMenu.pathName || buildMenu.name

    if (await this.hasMenu(buildMenu)) return false

    // 添加到数组头部中，以便把最新展示在前面
    this._data.unshift(menu as CollectMenu)

    await this.saveData()

    return true
  }

  /**
   * 修改收藏菜单
   * @param menu 菜单信息
   * @param isCover 是否覆盖原有数据，默认为 false
   */
  async updateMenu(menu: CollectMenu, isCover = false): Promise<boolean> {
    const index = this._data.findIndex(item => item.id === menu.id)
    if (index === -1) return false

    this._data[index] = isCover ? menu : {...this._data[index], ...menu}
    await this.saveData()

    return true
  }

  /**
   * 删除收藏菜单
   * @param menu 菜单信息
   */
  async removeMenu(menu: CollectMenu): Promise<boolean> {
    const index = this._data.findIndex(item => item.id === menu.id)
    if (index === -1) return false

    this._data.splice(index, 1)

    await this.saveData()
    return true
  }

  /**
   * 多选删除收藏菜单
   * @param menus 菜单信息
   */
  async removeManyMenus(menus: CollectMenu[]): Promise<void> {
    const removeIds = menus.map(item => item.id)
    this._data = this._data.filter(item => !removeIds.includes(item.id))
    await this.saveData()
  }

  /**
   * 获取所有收藏菜单
   */
  getAllMenus(): CollectMenu[] {
    return this._data.map(item => ({...item}))
  }
}
