<template>
  <el-menu mode="horizontal" v-bind="$attrs" class="my-menu">
    <MenuItem v-for="menu in menus" :key="menu.key" :menu="menu"></MenuItem>
  </el-menu>
</template>

<script setup lang="ts">
import {PropType} from 'vue'
import {Menu} from './Menu.type'
import {MenuItem} from './MenuItem'

defineProps({
  menus: {
    type: Array as PropType<Menu[]>,
    default: () => []
  }
})
</script>

<style scoped>
.my-menu {
  --el-menu-item-height: 36px;
}
</style>
