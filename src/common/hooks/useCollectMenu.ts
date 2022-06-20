import {CollectMenu, CollectMenuService} from '@/entries/popup/src/services/CollectMenu.service'
import {computed, ref} from 'vue'

// 收藏菜单服务
const collectMenuService = CollectMenuService.getInstance()

// 收藏菜单列表
const collectMenus = ref<CollectMenu[]>([])

// id 映射表
const collectMenuIdMap = computed<Map<string, CollectMenu>>(() => {
  const map = new Map<string, CollectMenu>()
  collectMenus.value.forEach(menu => map.set(menu.id, menu))
  return map
})

/**
 * 菜单收藏服务
 */
export function useCollectMenuService() {
  // 初始化
  collectMenuService.init()

  // 每当更新时获取最新收藏菜单
  collectMenuService.on('update', menus => {
    collectMenus.value = menus
  })

  // 是否已存在该菜单
  const hasMenu = (menu: CollectMenu) => collectMenuIdMap.value.has(menu.id)

  return {
    collectMenus,
    hasMenu,
    collectMenuService
  }
}
