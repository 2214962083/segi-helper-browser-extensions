/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {App, Component, createApp} from 'vue'
import EventEmitter from 'eventemitter3'
import {win} from '../../utils/common'
import {ExtensionStorageService} from '@/common/services/ExtensionStorage.service'

export type SiteRule = RegExp | string
export type MaybePromise<T> = T | Promise<T>

/**
 * 功能挂载任务
 */
export interface FeatureTask {
  start: () => MaybePromise<void>
  stop: () => MaybePromise<void>
}

/**
 * 功能服务基类接口
 */
export interface FeatureService<T extends BaseFeatureServiceEvent = BaseFeatureServiceEvent> extends EventEmitter<T> {
  isFeatureOn: boolean
  excludeSites: SiteRule[]
  includeSites: SiteRule[]
  init: () => Promise<void>
  mounted: () => Promise<boolean>
  unmounted: () => Promise<void>
  shouldRunInCurrentSite: () => boolean
}

/**
 * 功能服务基础 emitter 事件
 */
export interface BaseFeatureServiceEvent {
  init: () => void
  mounted: () => void
  unmounted: () => void
  turnOn: () => void
  turnOff: () => void
  updateExcludeSites: (excludeSites: SiteRule[]) => void
  updateIncludeSites: (includeSites: SiteRule[]) => void
}

/**
 * 功能服务基类构造参数
 */
export interface BaseFeatureServiceOptions {
  storageKeyPrefix: string
  defaultIsFeatureOn?: boolean
  defaultExcludeSites?: SiteRule[]
  defaultIncludeSites?: SiteRule[]
}

/**
 * 功能服务基类
 */
export class BaseFeatureService<T extends BaseFeatureServiceEvent = BaseFeatureServiceEvent>
  extends EventEmitter<T>
  implements FeatureService<T>
{
  /**
   * 所有的挂载任务
   */
  private _mountedTasks: FeatureTask[] = []

  /**
   * 浏览器扩展存储服务
   */
  extensionStorageService: ExtensionStorageService

  /**
   * 是否开启了这个功能
   */
  isFeatureOn!: boolean

  /**
   * isFeatureOn 默认值
   */
  defaultIsFeatureOn!: boolean

  /**
   * 排除的网站
   */
  excludeSites!: SiteRule[]

  /**
   * excludeSites 默认值
   */
  defaultExcludeSites!: SiteRule[]

  /**
   * 引入的网站
   */
  includeSites!: SiteRule[]

  /**
   * includeSites 默认值
   */
  defaultIncludeSites!: SiteRule[]

  constructor(options: BaseFeatureServiceOptions) {
    super()

    const {storageKeyPrefix, defaultIsFeatureOn, defaultExcludeSites, defaultIncludeSites} = options

    if (!storageKeyPrefix) {
      throw new Error('storageKeyPrefix is required')
    }

    // 初始化扩展存储服务
    this.extensionStorageService = new ExtensionStorageService({
      namespace: storageKeyPrefix
    })

    this.defaultExcludeSites = defaultExcludeSites ?? []

    this.defaultIncludeSites = defaultIncludeSites ?? [/\*/]

    this.defaultIsFeatureOn = defaultIsFeatureOn ?? true
  }

  /**
   * 初始化功能所需的东西
   * 如果 isFeatureOn 为 true 则执行 mounted
   */
  async init() {
    const excludeSites =
      (await this.extensionStorageService.getItem<SiteRule[]>('excludeSites')) ?? this.defaultExcludeSites
    this.excludeSites = excludeSites

    const includeSites =
      (await this.extensionStorageService.getItem<SiteRule[]>('includeSites')) ?? this.defaultIncludeSites
    this.includeSites = includeSites

    const isFeatureOn = (await this.extensionStorageService.getItem<boolean>('isFeatureOn')) ?? this.defaultIsFeatureOn
    isFeatureOn ? await this.turnOn() : await this.turnOff()

    return
  }

  /**
   * 挂载功能
   * @returns 是否需要走挂载流程
   */
  async mounted(): Promise<boolean> {
    // 卸载再挂载
    this.unmounted()

    // 如果当前功能是关闭状态，则不需要挂载
    if (!this.isFeatureOn) return false

    // 如果网站不在名单内，则不加载
    if (!this.shouldRunInCurrentSite()) return false

    // 执行所有挂载任务
    for (const task of this._mountedTasks) {
      await task.start()
    }

    // @ts-ignore
    this.emit('mounted')

    return true
  }

  /**
   *  卸载功能
   */
  async unmounted(): Promise<void> {
    // 执行所有卸载任务
    for (const task of this._mountedTasks) {
      await task.stop()
    }

    // @ts-ignore
    this.emit('unmounted')

    return
  }

  /**
   * 当前网站是否应该运行这个功能
   */
  shouldRunInCurrentSite(): boolean {
    const currentUrl = win.location.href
    return (
      this.includeSites.some(site => currentUrl.match(site)) && !this.excludeSites.some(site => currentUrl.match(site))
    )
  }

  /**
   * 打开此功能
   */
  async turnOn() {
    this.isFeatureOn = true
    await this.extensionStorageService.setItem('isFeatureOn', true)
    await this.mounted()

    // @ts-ignore
    this.emit('turnOn')

    return
  }

  /**
   * 关闭此功能
   */
  async turnOff() {
    this.isFeatureOn = false
    await this.extensionStorageService.setItem('isFeatureOn', false)
    await this.unmounted()

    // @ts-ignore
    this.emit('turnOff')

    return
  }

  /**
   * 更新排除的网站
   * @param excludeSites 排除的网站规则数组
   */
  async updateExcludeSites(excludeSites: SiteRule[]) {
    this.excludeSites = excludeSites
    await this.extensionStorageService.setItem('excludeSites', excludeSites)
    await this.mounted()

    // @ts-ignore
    this.emit('updateExcludeSites')

    return
  }

  /**
   * 更新引入的网站
   * @param includeSites 引入的网站规则数组
   */
  async updateIncludeSites(includeSites: SiteRule[]) {
    this.includeSites = includeSites
    await this.extensionStorageService.setItem('includeSites', includeSites)
    await this.mounted()

    // @ts-ignore
    this.emit('updateIncludeSites')

    return
  }

  /**
   * 添加挂载脚本任务
   * @param task 任务
   */
  addMountedScriptTask(task: FeatureTask) {
    this._mountedTasks.push(task)
  }

  /**
   * 添加挂载 vue 组件任务
   * @param vueComponent vue 组件
   * @param selector 选择器或 element
   */
  addMountedVueComponentTask(vueComponent: Component, selector?: string | Element | null | undefined) {
    let app: App | undefined
    let newMountedEl: HTMLElement | undefined

    const start = () => {
      let mountedEl: HTMLElement | null =
        typeof selector === 'string'
          ? win.document.querySelector<HTMLElement>(selector) ?? null
          : selector instanceof Element
          ? (selector as HTMLElement)
          : null

      if (!mountedEl) {
        newMountedEl = win.document.createElement('div')
        win.document.body.appendChild(newMountedEl)
        mountedEl = newMountedEl
      }

      app = createApp(vueComponent)
      app.mount(mountedEl)
    }

    const stop = () => {
      app?.unmount()
      newMountedEl?.remove()
    }

    this._mountedTasks.push({start, stop})
  }
}

export class FeaturesManager {
  static _instance: FeaturesManager
  static getInstance = () => FeaturesManager._instance || (FeaturesManager._instance = new FeaturesManager())

  private _features: FeatureService<BaseFeatureServiceEvent>[] = []

  async init() {
    return await Promise.allSettled(
      this._features.map(async feature => {
        return await feature.init()
      })
    )
  }

  async mounted() {
    return await Promise.allSettled(
      this._features.map(async feature => {
        return await feature.mounted()
      })
    )
  }

  async unmounted() {
    return await Promise.allSettled(
      this._features.map(async feature => {
        return await feature.unmounted()
      })
    )
  }

  addFeature(feature: FeatureService<BaseFeatureServiceEvent>) {
    this._features.push(feature)
  }
}
