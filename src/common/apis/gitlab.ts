import {http} from '../utils/request'

const gitlabBaseUrl = top?.location.origin ?? 'http://gitlab.uhomecp.com:9200'

export interface FetchFileTreeOptions {
  /**
   * 仓库名称，比如 xxx/share-docs
   */
  repoName: string

  /**
   * 仓库分支，比如 master
   */
  branchName: string

  /**
   * 是否递归，默认 false，递归只能返回一百条，还是自己多请求手动递归好点
   */
  recursive?: boolean

  /**
   * 返回多少条，默认 20，最多 100
   */
  per_page?: number

  /**
   * 从本仓库哪个文件路径开始查
   */
  path?: string
}

export interface RemoteGitlabFileTreeItem {
  /**
   * 文件 id
   */
  id: string

  /**
   * 不知道什么用
   */
  mode: string

  /**
   * 文件名
   */
  name: string

  /**
   * 文件路径
   */
  path: string

  /**
   * 文件类型
   */
  type: 'tree' | 'blob'
}

export type FetchFileTreeRes = RemoteGitlabFileTreeItem[]

/**
 * 获取 gitlab 文件树
 */
export const fetchFileTree = (options: FetchFileTreeOptions): Promise<FetchFileTreeRes> => {
  const {repoName, branchName = 'master', recursive = false, per_page = 100, path} = options

  // 请求路径
  const url = `${gitlabBaseUrl}/api/v4/projects/${encodeURIComponent(
    repoName
  )}/repository/tree?ref=${branchName}&recursive=${recursive}&per_page=${per_page}&path=${path}`

  return http(url, {
    cacheSessionStorage: true,
    formatType: 'json',
    resolveCondition: res => Array.isArray(res)
  })
}

export interface FetchFileRawOptions {
  /**
   * 仓库名称，比如 xxx/share-docs
   */
  repoName: string

  /**
   * 仓库分支，比如 master
   */
  branchName: string

  /**
   * 文件路径
   */
  path: string
}

/**
 * 获取 gitlab 代码原始内容
 */
export const fetchFileRaw = async (options: FetchFileRawOptions) => {
  const {repoName, branchName = 'master', path} = options
  const url = `${gitlabBaseUrl}/${repoName}/raw/${branchName}/${path}`
  const res = await fetch(url)
  const contentType = res.headers.get('content-type')
  if (contentType?.match('text')) {
    return await res.text()
  } else {
    return await res.blob()
  }
}

export interface RemoteGitlabRepo {
  /**
   * 仓库 id
   */
  id: number

  /**
   * 仓库描述
   */
  description: string

  /**
   * 仓库名称
   */
  name: string

  /**
   * 带有命名空间的仓库名称
   */
  name_with_namespace: string

  /**
   * 仓库路径
   */
  path: string

  /**
   * 带有命名空间的仓库路径
   */
  path_with_namespace: string

  /**
   * 创建时间
   */
  created_at: Date

  /**
   * 默认分支名称
   */
  default_branch: string

  /**
   * 仓库的 ssh url
   */
  ssh_url_to_repo: string

  /**
   * 仓库的 http url
   */
  http_url_to_repo: string

  /**
   * 仓库 web 地址
   */
  web_url: string

  /**
   * 仓库的 readme 地址
   */
  readme_url: string

  /**
   * 仓库星星数
   */
  star_count: number

  /**
   * 仓库的 fork 数
   */
  forks_count: number

  /**
   * 最近更新时间
   */
  last_activity_at: Date

  /**
   * 是否公开
   */
  public_jobs: boolean
}

export interface SearchReposOptions {
  /**
   * 仓库名称
   */
  name: string
}

/**
 * 搜索 gitlab 仓库
 */
export const searchReposByName = (options: SearchReposOptions): Promise<RemoteGitlabRepo[]> => {
  const {name} = options

  // 请求路径
  const url = `${gitlabBaseUrl}/api/v4/projects?search=${name}`

  return http(url, {
    cacheSessionStorage: true,
    formatType: 'json',
    resolveCondition: res => Array.isArray(res)
  })
}
