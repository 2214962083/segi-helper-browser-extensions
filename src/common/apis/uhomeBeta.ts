import {RemoteBetaMenu} from '@/common/utils/type-helper'
import {http} from '../utils/request'

// 获取远程菜单
export const fetchMenuListUrl = `/authc-restapi/portal/menuList?_t=${Date.now()}`
export const fetchMenuList = (): Promise<RemoteBetaMenu[]> =>
  http(fetchMenuListUrl, {cacheSessionStorage: true, formatType: 'json'}).then(res => res.data.menuList.child)
