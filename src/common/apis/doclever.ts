/* eslint-disable @typescript-eslint/no-explicit-any */
import {http} from '../utils/request'

export const docleverBaseUrl = top?.location.origin ?? 'http://192.168.1.11:9090'

type DocleverRes<T = any> = {
  code: number
  data: T
  msg: string
}

export type FetchProjectListRes = DocleverRes<{
  public: DocleverProject[]
}>

export interface DocleverProject {
  /**
   * 项目 id
   */
  _id: string

  /**
   * 项目名称
   */
  name: string

  /**
   * 创建时间
   */
  createdAt: Date

  /**
   * 接口数量
   */
  interfaceCount: number
}

/**
 * 获取所有 doclever 项目
 */
export const fetchProjectList = (): Promise<DocleverProject[]> => {
  const url = `${docleverBaseUrl}/project/list?sbdoctimestamps=${Date.now()}`

  return http<FetchProjectListRes>(url, {
    cacheSessionStorage: true,
    formatType: 'json',
    resolveCondition: res => res && res.code === 200
  }).then(res => res.data.public)
}

export type FetchInterfacesListByProjectRes = DocleverRes<{
  data: DocleverProjectInterfaceGroup[]
  baseUrl: DocleverProjectBaseURL[]
}>

export interface DocleverProjectBaseURL {
  url: string
  remark: string
}

export interface DocleverProjectInterfaceGroup {
  /**
   * 类型
   */
  type: number

  /**
   * 排序
   */
  sort: number

  /**
   * 接口组 id
   */
  _id: string

  /**
   * 接口组名称
   */
  name: string

  /**
   * 所属项目 id
   */
  project: string

  /**
   * 接口组 id
   */
  id: string

  /**
   * 创建时间
   */
  createdAt: Date

  /**
   * 更新时间
   */
  updatedAt: Date

  /**
   * 接口列表
   */
  data: Array<DocleverProjectInterfaceGroup | DocleverProjectInterface>
}

export interface DocleverProjectInterface {
  /**
   * 接口是否已完成
   */
  finish: number

  /**
   * 接口 id
   */
  _id: string

  /**
   * 接口名字
   */
  name: string

  /**
   * 接口 url
   */
  url: string

  /**
   * 接口请求方式
   */
  method: string

  /**
   * 接口 id
   */
  id: string
}

export interface FetchInterfacesListByProjectOptions {
  /**
   * 项目 id
   */
  projectId: string

  /**
   * 排序
   */
  sort?: number
}

/**
 * 查询某个 doclever 项目下的所有接口
 */
export const fetchInterfacesListByProject = (
  options: FetchInterfacesListByProjectOptions
): Promise<FetchInterfacesListByProjectRes['data']> => {
  const {projectId, sort = 0} = options
  const url = `${docleverBaseUrl}/project/interface?id=${projectId}&sort=${sort}&sbdoctimestamps=${Date.now()}`
  return http<FetchInterfacesListByProjectRes>(url, {
    formatType: 'json',
    resolveCondition: res => res && res.code === 200
  }).then(res => res.data)
}
