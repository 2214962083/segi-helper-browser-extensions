import {ExtensionStorageService} from '@/common/services/ExtensionStorage.service'
import {valToHash} from '@/common/utils/common'
import {UhomecpMenu} from '@/common/utils/type-helper'
import {EventEmitter} from 'eventemitter3'
import {SetRequired} from 'type-fest'

export interface CollectMenu extends UhomecpMenu {
  /**
   * 是否是自定义菜单
   */
  isCustom?: boolean
}

export type CollectMenuServiceEvents = {
  /**
   * 收集菜单发生变化
   */
  update: (menus: CollectMenu[]) => void
}

/**
 * 收藏菜单服务
 */
export class CollectMenuService extends EventEmitter<CollectMenuServiceEvents> {
  static _instance: CollectMenuService
  static getInstance = () => CollectMenuService._instance || (CollectMenuService._instance = new CollectMenuService())

  // 存储所用的 key，请勿修改，否则别人会丢失数据
  static _storageKey = 'collectMenu'

  // 收藏菜单列表
  private _data: CollectMenu[] = []

  // 是否已经初始化
  private _isInit = false

  // 用于判断是否初始化中
  private _isInitRunning = false

  // 扩展存储服务
  private _extensionStorageService = ExtensionStorageService.getInstance()

  constructor() {
    super()
  }

  /**
   * 初始化
   */
  async init() {
    if (this._isInit) return
    if (this._isInitRunning) return
    this._isInitRunning = true
    await this.loadData().finally(() => (this._isInitRunning = false))
    this._isInit = true
  }

  /**
   * 广播更新事件
   */
  private _onUpdate() {
    this.emit('update', this.getAllMenus())
  }

  /**
   * 从扩展存储中获取数据
   */
  async loadData() {
    this._data = (await this._extensionStorageService.getItem(CollectMenuService._storageKey)) ?? []
    console.log('loadData', this._data)
    return this._onUpdate()
  }

  /**
   * 保存数据到扩展存储中
   */
  async saveData() {
    await this._extensionStorageService.setItem(CollectMenuService._storageKey, this._data)
  }

  /**
   * 是否存在菜单
   * @param menu 菜单信息
   */
  hasMenu(menu: CollectMenu): boolean {
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

    if (this.hasMenu(buildMenu)) return false

    // 添加到数组头部中，以便把最新展示在前面
    this._data.unshift(menu as CollectMenu)

    await this.saveData()
    this._onUpdate()

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
    this._onUpdate()

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
    this._onUpdate()

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
    this._onUpdate()
  }

  /**
   * 获取所有收藏菜单
   */
  getAllMenus(): CollectMenu[] {
    return this._data.map(item => ({...item}))
  }
}
