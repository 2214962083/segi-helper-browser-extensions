<template>
  <div class="p-4 w-screen min-w-150 min-h-150 h-screen rounded relative overflow-hidden text-gray-700">
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
    <Settings v-show="menuActive === MenuKey.settings"></Settings>
    <Helper v-show="menuActive === MenuKey.helper"></Helper>
    <About v-show="menuActive === MenuKey.about"></About>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import MyMenu from '@/common/components/Menu.vue'
import {Menu} from '@/common/components/Menu.type'
import Settings from './views/tabs/Settings.vue'
import Helper from './views/tabs/Helper.vue'
import About from './views/tabs/About.vue'

enum MenuKey {
  settings = 'settings',
  helper = 'helper',
  about = 'about'
}

const menuActive = ref(MenuKey.settings)
const menus = ref<Menu[]>([
  {
    key: MenuKey.settings,
    title: '设置'
  },
  {
    key: MenuKey.helper,
    title: '帮助'
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
