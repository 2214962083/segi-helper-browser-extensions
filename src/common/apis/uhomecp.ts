import {RemoteUhomecpMenu} from '@/common/utils/type-helper'
import {http} from '../utils/request'

// 获取远程菜单
export const fetchMenuListUrl = `http://beta.uhomecp.com/authc-restapi/portal/menuList`
export const fetchMenuList = (): Promise<RemoteUhomecpMenu[]> =>
  http(fetchMenuListUrl, {cacheSessionStorage: true, formatType: 'json'}).then(res => res.data.menuList.child)
