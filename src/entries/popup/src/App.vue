<template>
  <div class="w-150 p-4 h-screen rounded relative overflow-hidden text-gray-700">
    <div class="absolute top-0 left-0 z-10 w-full">
      <!-- 顶部菜单 -->
      <MyMenu
        class="w-full"
        :default-active="menuActive"
        :ellipsis="false"
        :menus="menus"
        @select="handleSelectMenu"
      ></MyMenu>
    </div>
    <div class="blank w-full h-8"></div>
    <SearchMenu v-show="menuActive === MenuKey.searchUhomecpMenu"></SearchMenu>
    <CollectMenu v-show="menuActive === MenuKey.collectUhomecpMenu"></CollectMenu>
    <Settings v-show="menuActive === MenuKey.settings"></Settings>
    <About v-show="menuActive === MenuKey.about"></About>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import MyMenu from '@/common/components/menu.vue'
import {Menu} from '@/common/components/menu.type'
import SearchMenu from './views/tabs/SearchMenu.vue'
import CollectMenu from './views/tabs/CollectMenu.vue'
import Settings from './views/tabs/Settings.vue'
import About from './views/tabs/About.vue'

enum MenuKey {
  searchUhomecpMenu = 'searchUhomecpMenu',
  collectUhomecpMenu = 'collectUhomecpMenu',
  settings = 'settings',
  about = 'about'
}

const menuActive = ref(MenuKey.searchUhomecpMenu)
const menus = ref<Menu[]>([
  {
    key: MenuKey.searchUhomecpMenu,
    title: '搜索菜单'
  },
  {
    key: MenuKey.collectUhomecpMenu,
    title: '收藏菜单'
  },
  {
    key: MenuKey.settings,
    title: '设置'
  },
  {
    key: MenuKey.about,
    title: '关于'
  }
])

function handleSelectMenu(menuKey: MenuKey) {
  menuActive.value = menuKey
}
</script>

<style scoped></style>
