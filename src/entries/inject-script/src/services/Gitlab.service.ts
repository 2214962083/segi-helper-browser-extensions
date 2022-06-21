/* eslint-disable @typescript-eslint/no-explicit-any */

import {fetchFileTree, RemoteGitlabFileTreeItem} from '@/common/apis/gitlab'
import {win} from '../utils/common'

export interface GitlabFileTreeItem extends RemoteGitlabFileTreeItem {
  /**
   * 节点标题
   */
  label: string

  /**
   * 文件全路径
   */
  fullUrl: string

  /**
   * 是否是文件
   */
  isFile: boolean

  /**
   * 子节点
   */
  children?: GitlabFileTreeItem[]
}

export class GitlabService {
  static _instance: GitlabService
  static getInstance = () => GitlabService._instance || (GitlabService._instance = new GitlabService())

  /**
   * 当前仓库标题
   */
  private _repoTitle!: string

  /**
   * 当前仓库基础路径
   */
  private _repoBaseUrl!: string

  /**
   * 当前仓库分支
   */
  private _repoBranch!: string

  /**
   * 当前仓库标题
   */
  get repoTitle() {
    return this._repoTitle
  }

  /**
   * 当前仓库基础路径
   */
  get repoBaseUrl() {
    return this._repoBaseUrl
  }

  /**
   * 当前仓库分支
   */
  get repoBranch() {
    return this._repoBranch
  }

  /**
   * 初始化
   */
  init() {
    this.updateRepoInfo()
  }

  /**
   * 更新当前仓库信息
   */
  updateRepoInfo() {
    this.updateRepoTitle()
    this.updateRepoBaseUrl()
    this.updateRepoBranch()
  }

  /**
   * 更新当前仓库标题
   */
  updateRepoTitle() {
    this._repoTitle =
      win.document
        .querySelector<HTMLLinkElement>('.nav-sidebar .context-header a')
        ?.getAttribute('href')
        ?.replace(/^\//, '') || win.document.title
  }

  /**
   *  更新当前仓库基础路径
   */
  updateRepoBaseUrl() {
    this._repoBaseUrl = win.document.querySelector<HTMLLinkElement>('.nav-sidebar .context-header a')?.href ?? ''
  }

  /**
   * 更新当前仓库分支
   */
  updateRepoBranch() {
    this._repoBranch = win.document.querySelector<HTMLElement>('.qa-branches-select')?.dataset?.selected ?? 'master'
  }

  /**
   * 获取完整文件树
   * @param filePath 文件路径
   */
  async getAllFileTree(filepath = '/'): Promise<GitlabFileTreeItem[]> {
    const tree = await fetchFileTree({
      repoName: this.repoTitle,
      branchName: this.repoBranch,
      path: filepath
    })

    const finalTree: GitlabFileTreeItem[] = []
    const promises: Promise<void>[] = []
    tree.map(treeItem => {
      const item = this.buildFileTreeItem(treeItem)
      finalTree.push(item)
      if (item.children) {
        const promise = this.getAllFileTree(item.path).then(children => {
          item.children = children
          return
        })
        promises.push(promise)
      }
    })

    await Promise.allSettled(promises)

    return finalTree
  }

  /**
   * 根据文件路径获取文件 url
   * @param filepath 文件路径
   * @param isFile 是否是文件
   */
  getRepoFileOrFolderUrl(filePath: string, isFile = false): string {
    const {repoBaseUrl, repoBranch} = this
    return isFile ? `${repoBaseUrl}/blob/${repoBranch}/${filePath}` : `${repoBaseUrl}/tree/${repoBranch}/${filePath}`
  }

  /**
   * 处理生成完整的节点信息
   * @param remoteTreeItem gitlab 文件节点
   */
  buildFileTreeItem(remoteTreeItem: RemoteGitlabFileTreeItem): GitlabFileTreeItem {
    const isFile = remoteTreeItem.type === 'blob'
    const treeItem: GitlabFileTreeItem = {
      ...remoteTreeItem,
      label: remoteTreeItem.name,
      isFile,
      fullUrl: this.getRepoFileOrFolderUrl(remoteTreeItem.path, isFile)
    }

    if (!isFile) {
      treeItem.children = []
    }

    return treeItem
  }
}
