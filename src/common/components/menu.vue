<template>
  <el-menu w-full mode="horizontal" v-bind="$attrs" class="my-menu">
    <MenuItem v-for="menu in menus" :key="menu.key" :menu="menu"></MenuItem>
  </el-menu>
</template>

<script setup lang="ts">
import {PropType} from 'vue'
import {Menu} from './menu.type'
import {MenuItem} from './menu-item'

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
