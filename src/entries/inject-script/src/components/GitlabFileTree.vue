<template>
  <div class="segi-gitlab-tree">
    <!-- 左侧抽屉 -->
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
        <!-- 抽屉标题 -->
        {{ repoTitle }}
      </template>

      <!-- 文件树 -->
      <el-tree
        :data="fileTree"
        node-key="id"
        accordion
        :default-expanded-keys="defaultExpandedKeys"
        @node-click="handleFileNodeClick"
      >
        <template #default="{node, data}">
          <DynamicIcon :name="data.iconName" :is-open="node.expanded" class="text-sm mr-2" />
          <span style="line-height: 1rem">{{ node.label }}</span>
        </template>
      </el-tree>
    </el-drawer>

    <!-- 左侧抽屉开关 -->
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
import {onMounted, reactive, ref, watch} from 'vue'
import {useElementHover, useEventListener} from '@vueuse/core'
import {GitlabFileTreeItem, GitlabService} from '../services/Gitlab.service'
import {win} from '../utils/common'
import {useStorage} from '@/common/utils/common'
import DynamicIcon from './DynamicIcon'

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
 * 仓库标题
 */
const repoTitle = ref('')

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

/**
 * 抽屉打开动画结束
 */
function handleOpened() {
  isDrawerOpened.value = true
}

/**
 * 抽屉开始关闭
 */
function handleClose() {
  isDrawerOpened.value = false
}

// 文件树是否加载中
const fileTreeLoading = ref(false)

// 文件树
const fileTree = ref<GitlabFileTreeItem[]>()

// 当前文件节点
const currentFileNode = ref<GitlabFileTreeItem>()

// 默认展开的文件节点
const defaultExpandedKeys = ref<string[]>([])

// gitlab service
const gitlabService = GitlabService.getInstance()

// 临时状态存储
const [getState, saveState, removeState] = useStorage('segi-gitlab-file-tree-temp-state', 'session')

// 临时状态
const gitlabFileTreeTempState = reactive({
  fileTree,
  drawerVisible,
  isDrawerOpened,
  isDrawerSwitchDomHovered,
  drawerBodyClassName
})

/**
 * 查找当前页面所属文件节点
 */
function findCurrentFileNode(fileTree: GitlabFileTreeItem[]) {
  // 注意要 decodeURIComponent ，否则中文匹配不中
  const currentFileFullUrl = decodeURIComponent(win.location.origin + win.location.pathname)
  let currentNode: GitlabFileTreeItem | undefined
  gitlabService.traverseFileTree(fileTree, (item: GitlabFileTreeItem) => {
    if (item.fullUrl === currentFileFullUrl) {
      currentNode = item
      return
    }
  })
  console.log('currentNode', currentNode)
  return currentNode
}

/**
 * 保存临时状态
 */
function saveTempState() {
  saveState(gitlabFileTreeTempState)
}

/**
 * 恢复临时状态
 */
function recoverTempState() {
  const state = getState()
  if (state) {
    Object.assign(gitlabFileTreeTempState, state)
    removeState()
    return true
  }
  return false
}

/**
 * 文件节点点击回调
 */
function handleFileNodeClick(node: GitlabFileTreeItem) {
  if (node.isFile) {
    saveTempState()
    win.location.href = node.fullUrl
  }
}

// 如果文件树存在，则查找当前文件节点
watch(
  () => fileTree.value?.length,
  val => {
    if (val) {
      console.log('gitlabService all tree', fileTree.value)
      currentFileNode.value = findCurrentFileNode(fileTree?.value ?? [])
      if (currentFileNode.value) {
        defaultExpandedKeys.value = [currentFileNode.value.id]
      }
    }
  },
  {
    immediate: true
  }
)

onMounted(async () => {
  // 初始化 gitlab service
  gitlabService.init()

  // 获取仓库标题
  repoTitle.value = gitlabService.repoTitle

  // 尝试恢复临时状态
  const recoverStatus = recoverTempState()

  // 恢复成功，不再获取 tree
  if (recoverStatus) return

  // 文件树是否加载中
  fileTreeLoading.value = true

  // 获取文件树
  fileTree.value = await gitlabService.getAllFileTree().finally(() => {
    fileTreeLoading.value = false
  })
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
