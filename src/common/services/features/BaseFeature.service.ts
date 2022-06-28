/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {App, Component, createApp} from 'vue'
import EventEmitter from 'eventemitter3'
import {win} from '@/entries/inject-script/src/utils/common'
import {ExtensionStorageService} from '@/common/services/ExtensionStorage.service'
import {EXCLUDE_SITES_STORAGE_KEY, INCLUDE_SITES_STORAGE_KEY, IS_FEATURE_ON_STORAGE_KEY} from '@/common/utils/constants'
import {getCurrentContext, onMessage} from 'webext-bridge'
import {sendMessageToCurrentTab} from '@/common/utils/common'
import {Class} from 'type-fest'

/**
 * message 与 emitter 装饰器，popup 和 window 双向监听 message
 */
export function MessageAndEmit(): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    // 当前函数名称
    const methodName = propertyKey.toString()

    // 根据缓存命名空间创建 message id
    const createMessageId = (storageKeyPrefix: string) => `${storageKeyPrefix}.${methodName}`

    // 保存原始函数体
    const method = descriptor.value

    // 当前上下文
    const context = getCurrentContext()

    // 要发送的目标上下文
    const targetContext = context === 'window' ? 'popup' : 'window'

    // 如果函数为空，则直接返回
    if (!method || typeof method !== 'function') return descriptor

    // 发送本次函数执行的参数给别的 context 执行同样的函数
    const sendMsg = async (messageId: string, methodArgs: any[]) => {
      return await sendMessageToCurrentTab(messageId, methodArgs, targetContext)
    }

    // 重写本函数,当执行时自动 emit 和发送 message 到其他 context
    descriptor.value = async function (this: any, ...args: any[]) {
      const result = await method.call(this, ...args)
      const messageId = createMessageId(this.storageKeyPrefix)
      await sendMsg(messageId, args)
      this?.emit?.(methodName, result)

      return result
    }

    // 保存 on message 监听队列, 这个将会在 class decorator 取出来在 constructor 中执行
    target._listenMessageFns = target._listenMessageFns || []
    target._listenMessageFns.push(async function (this: any) {
      const messageId = createMessageId(this.storageKeyPrefix)
      onMessage(messageId, async ({data}) => {
        // @ts-ignore
        const result = await method.call(this, ...data)
        this?.emit?.(methodName, result)
        return result
      })
    })

    return descriptor
  }
}

/**
 * 调取 MessageAndEmit 保存的 on message 监听队列, 在 constructor 中执行监听
 */
export function StartOnMessage(): ClassDecorator {
  // @ts-ignore
  return function (constructor: Class) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args)
        const _listenMessageFns = super._listenMessageFns || []
        _listenMessageFns.map((fn: Function) => fn?.call?.(this))
      }
    }
  }
}

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
  storageKeyPrefix: string
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
@StartOnMessage()
export class BaseFeatureService<T extends BaseFeatureServiceEvent = BaseFeatureServiceEvent>
  extends EventEmitter<T>
  implements FeatureService<T>
{
  /**
   * 所有的挂载任务
   */
  private _mountedTasks: FeatureTask[] = []

  /**
   * 当前是否是网页 window 环境
   */
  private _isWindow: boolean

  /**
   * 存储命名空间
   */
  storageKeyPrefix: string

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

    this.storageKeyPrefix = storageKeyPrefix

    this._isWindow = getCurrentContext() === 'window'

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
      (await this.extensionStorageService.getItem<SiteRule[]>(EXCLUDE_SITES_STORAGE_KEY)) ?? this.defaultExcludeSites
    this.excludeSites = excludeSites

    const includeSites =
      (await this.extensionStorageService.getItem<SiteRule[]>(INCLUDE_SITES_STORAGE_KEY)) ?? this.defaultIncludeSites
    this.includeSites = includeSites

    const isFeatureOn =
      (await this.extensionStorageService.getItem<boolean>(IS_FEATURE_ON_STORAGE_KEY)) ?? this.defaultIsFeatureOn
    isFeatureOn ? await this.turnOn() : await this.turnOff()

    return
  }

  /**
   * 挂载功能
   * @returns 是否需要走挂载流程
   */
  @MessageAndEmit()
  async mounted(): Promise<boolean> {
    if (!this._isWindow) return false

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

    return true
  }

  /**
   *  卸载功能
   */
  @MessageAndEmit()
  async unmounted(): Promise<void> {
    if (!this._isWindow) return

    // 执行所有卸载任务
    for (const task of this._mountedTasks) {
      await task.stop()
    }

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
  @MessageAndEmit()
  async turnOn() {
    this.isFeatureOn = true
    await this.extensionStorageService.setItem(IS_FEATURE_ON_STORAGE_KEY, true)
    await this.mounted()

    return
  }

  /**
   * 关闭此功能
   */
  @MessageAndEmit()
  async turnOff() {
    this.isFeatureOn = false
    await this.extensionStorageService.setItem(IS_FEATURE_ON_STORAGE_KEY, false)
    await this.unmounted()

    return
  }

  /**
   * 更新排除的网站
   * @param excludeSites 排除的网站规则数组
   */
  @MessageAndEmit()
  async updateExcludeSites(excludeSites: SiteRule[]) {
    this.excludeSites = excludeSites
    await this.extensionStorageService.setItem(EXCLUDE_SITES_STORAGE_KEY, excludeSites)
    await this.mounted()
    return
  }

  /**
   * 更新引入的网站
   * @param includeSites 引入的网站规则数组
   */
  @MessageAndEmit()
  async updateIncludeSites(includeSites: SiteRule[]) {
    this.includeSites = includeSites
    await this.extensionStorageService.setItem(INCLUDE_SITES_STORAGE_KEY, includeSites)
    await this.mounted()

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

  findService<T extends Class<BaseFeatureService>>(service: T): InstanceType<T> | undefined {
    return this._features.find(feature => feature instanceof (service as any)) as InstanceType<T>
  }

  getAllServices(): FeatureService<BaseFeatureServiceEvent>[] {
    return [...this._features]
  }
}
