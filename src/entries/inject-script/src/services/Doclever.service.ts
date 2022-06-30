import {
  docleverBaseUrl,
  DocleverProjectInterface,
  DocleverProjectInterfaceGroup,
  fetchInterfacesListByProject,
  fetchProjectList
} from '@/common/apis/doclever'
import {hasOwnKey} from '@/common/utils/common'

export type DocleverTreeType = 'project' | 'group' | 'interface'

export interface DocleverTreeItem {
  _id: string
  name: string
  type: DocleverTreeType
  fullPathName: string
  projectShareUrl: string
  apiUrl: string
  children?: DocleverTreeItem[]
}

export class DocleverService {
  static _instance: DocleverService
  static getInstance = () => DocleverService._instance || (DocleverService._instance = new DocleverService())

  static _pathNameConnector = ' >> '

  createProjectShareUrl(projectId: string) {
    return `${docleverBaseUrl}/html/web/controller/public/public.html#${projectId}`
  }

  /**
   * 遍历 api 树
   * @param tree api 树
   * @param callback 回调函数
   * @param depth 当前深度（不用传，这是内部计算，在callback会回调）
   */
  traverseDocleverTree = (
    tree: DocleverTreeItem[],
    callback: (item: DocleverTreeItem, depth: number) => void,
    depth: number
  ) => {
    tree.forEach(item => {
      callback(item, depth)
      if (item.children) {
        this.traverseDocleverTree(item.children, callback, depth + 1)
      }
    })
  }

  /**
   * 获取完整 doclever 树
   */
  async getAllDocleverTree(): Promise<DocleverTreeItem[]> {
    const projectList = await fetchProjectList()
    const tree: DocleverTreeItem[] = []
    const promises: Promise<void>[] = []

    // 遍历项目
    projectList.forEach(project => {
      const projectPathName = project.name
      const projectItem: DocleverTreeItem = {
        _id: project._id ?? '',
        name: project.name ?? '',
        type: 'project',
        fullPathName: project.name ?? '',
        projectShareUrl: this.createProjectShareUrl(project._id),
        apiUrl: '',
        children: []
      }
      tree.push(projectItem)

      // 请求项目具体接口
      const promise = fetchInterfacesListByProject({projectId: project._id}).then(res => {
        const interfaceGroups = res.data
        projectItem.children = this.buildGroupTree(interfaceGroups, project._id, projectPathName)
      })

      promises.push(promise)
    })

    await Promise.allSettled(promises)

    return tree
  }

  /**
   * 构建接口组树
   * @param tree 接口组树或接口树
   * @param projectId 项目 id
   * @param prefixPathName 前缀路径名
   */
  buildGroupTree(
    tree: Array<DocleverProjectInterfaceGroup | DocleverProjectInterface>,
    projectId: string,
    prefixPathName = ''
  ) {
    //是否是 api 接口 item
    const isApi = (item: DocleverProjectInterfaceGroup | DocleverProjectInterface): item is DocleverProjectInterface =>
      hasOwnKey(item as DocleverProjectInterface, 'finish')

    // 最终树
    const finalTree: DocleverTreeItem[] = []

    tree.forEach(item => {
      if (isApi(item)) {
        // 当前 item 是接口
        const apiPathName = `${prefixPathName}${DocleverService._pathNameConnector}${item.name}`
        const apiItem: DocleverTreeItem = {
          _id: item._id ?? '',
          name: item.name ?? '',
          type: 'interface',
          fullPathName: apiPathName,
          projectShareUrl: this.createProjectShareUrl(projectId),
          apiUrl: item.url ?? ''
        }
        finalTree.push(apiItem)
      } else {
        // 当前 item 是接口组
        const groupPathName = `${prefixPathName}${DocleverService._pathNameConnector}${item.name}`
        const groupItem: DocleverTreeItem = {
          _id: item._id ?? '',
          name: item.name ?? '',
          type: 'group',
          fullPathName: groupPathName,
          projectShareUrl: this.createProjectShareUrl(projectId),
          apiUrl: '',
          children: []
        }
        if (item.data && item.data.length) {
          groupItem.children = this.buildGroupTree(item.data, projectId, groupPathName)
        }
        finalTree.push(groupItem)
      }
    })

    return finalTree
  }

  /**
   * 抹平 doclever 树
   */
  flattenDocleverTree(tree: DocleverTreeItem[]) {
    const result: DocleverTreeItem[] = []
    this.traverseDocleverTree(
      tree,
      item => {
        result.push(item)
      },
      0
    )
    return result
  }

  /**
   * 获取 api 列表
   */
  async getApiList(): Promise<DocleverTreeItem[]> {
    const tree = await this.getAllDocleverTree()
    return this.flattenDocleverTree(tree).filter(item => item.type === 'interface')
  }
}
