<template>
  <div class="segi-gitlab-tree">
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="381px"
      :show-close="false"
      :modal="false"
      :custom-class="drawerBodyClassName"
      @opened="handleOpened"
      @close="handleClose"
    >
      <template #header>
        {{ repoTitle }}
      </template>

      <el-tree :data="fileTree" />
    </el-drawer>
    <div
      v-show="!drawerVisible"
      ref="drawerSwitchDom"
      style="top: calc(50vh - 8rem)"
      class="w-8 h-32 !p-4 cursor-pointer overflow-hidden text-sm flex flex-col items-center justify-center fixed left-0 z-9999 bg-white shadow-normal rounded-r-lg whitespace-normal"
    >
      代码目录
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import {onMounted, ref, watch} from 'vue'
import {useElementHover, useEventListener} from '@vueuse/core'
import {GitlabFileTreeItem, GitlabService} from '../services/Gitlab.service'

// 抽屉开关按钮
const drawerSwitchDom = ref()

// 抽屉开关是否 hover
const isDrawerSwitchDomHovered = useElementHover(drawerSwitchDom)

// 控制抽屉显隐
const drawerVisible = ref(false)

// 抽屉是否已打开
const isDrawerOpened = ref(false)

// 抽屉内容区域 class name
const drawerBodyClassName = 'segi-gitlab-tree-drawer-body'

/**
 * 仓库基础路径
 */
const repoBaseUrl = ref('')

/**
 * 仓库标题
 */
const repoTitle = ref('')

/**
 * 仓库分支
 */
const repoBranch = ref('master')

onMounted(() => {
  // 监听鼠标移出抽屉时，关闭抽屉
  const drawerBodyDom = document.querySelector(`.${drawerBodyClassName}`)
  if (!drawerBodyDom) return
  useEventListener(
    drawerBodyDom,
    'mouseleave',
    () => {
      if (drawerVisible.value && isDrawerOpened.value) {
        drawerVisible.value = false
      }
    },
    false
  )
})

// 当 hover 中抽屉开关时，打开抽屉
watch(isDrawerSwitchDomHovered, val => {
  if (val) drawerVisible.value = true
})

function handleOpened() {
  isDrawerOpened.value = true
}

function handleClose() {
  isDrawerOpened.value = false
}

const fileTree = ref<GitlabFileTreeItem[]>()
const gitlabService = GitlabService.getInstance()

onMounted(async () => {
  gitlabService.init()
  fileTree.value = await gitlabService.getAllFileTree()
  console.log('gitlabService all tree', fileTree.value)
})
</script>

<style scoped>
.segi-gitlab-tree ::v-deep(.el-drawer__header) {
  padding-bottom: 20px;
  margin: 0;
}

.segi-gitlab-tree ::v-deep(.el-drawer__body) {
  padding-top: 0;
}
</style>
