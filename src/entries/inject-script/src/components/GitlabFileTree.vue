<template>
  <div
    class="segi-gitlab-tree"
    :style="{
      '--drawer-width': fileTreeContainerMaxWidth + 'px'
    }"
  >
    <!-- 左侧抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      :size="fileTreeContainerMaxWidth"
      :show-close="false"
      :modal="false"
      modal-class="segi-gitlab-tree-drawer-modal-isDin"
      :custom-class="{[drawerBodyClassName]: true, 'segi-gitlab-tree-drawer-body-isDin': isDin}"
      @opened="handleOpened"
      @close="handleClose"
    >
      <template #header>
        <div class="w-full">
          <div class="w-full flex justify-between items-center">
            <div>
              <!-- 抽屉标题 -->
              {{ repoTitle }}
            </div>
            <div class="flex flex-shrink-0">
              <el-icon :size="18" alt="进入或退出全屏" class="cursor-pointer !mr-2" @click="handleFullscreenClick">
                <FullScreen></FullScreen>
              </el-icon>
              <el-icon :size="18" alt="是否固定" class="cursor-pointer" @click="handleDinClick">
                <Unlock v-if="!isDin"></Unlock>
                <Lock v-else></Lock>
              </el-icon>
            </div>
          </div>
          <!-- 搜索框 -->
          <el-input v-model="fileNameKeywords" placeholder="搜索文件" class="mt-4" />
        </div>
      </template>

      <!-- 文件树 -->
      <el-tree
        ref="fileTreeRef"
        v-loading="fileTreeLoading"
        :data="fileTree"
        node-key="id"
        accordion
        :default-expanded-keys="defaultExpandedKeys"
        :filter-node-method="filterFileNode"
        @node-click="handleFileNodeClick"
      >
        <!-- 自定义每个节点的渲染 -->
        <template #default="{node, data}">
          <!-- hover 冒出文件名 -->
          <el-popover
            popper-class="segi-gitlab-tree-popover"
            width="400"
            trigger="hover"
            :show-arrow="false"
            placement="right"
            :hide-after="0"
            transition=""
          >
            <span>{{ data.name }}</span>
            <template #reference>
              <div
                class="flex items-center h-full cursor-pointer"
                :class="[data.id === currentFileNode?.id ? 'bg-yellow-200/50 text-yellow-800' : '']"
              >
                <DynamicIcon :name="data.iconName" :is-open="node.expanded" class="text-sm mr-2" />
                <span style="line-height: 1rem">
                  {{ node.label }}
                </span>
              </div>
            </template>
          </el-popover>
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

    <GitlabFileViewer
      ref="fileViewerRef"
      :repo-name="gitlabService.repoTitle"
      :branch-name="gitlabService.repoBranch"
      :path="currentFileNode?.path"
      :is-din="isDin"
      :drawer-width="fileTreeContainerMaxWidth"
    />

    <!-- gitlab 全局搜索 -->
    <GitlabSearch />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import {nextTick, onMounted, reactive, ref, watch} from 'vue'
import {useElementHover, useEventListener, onClickOutside, watchDebounced} from '@vueuse/core'
import {GitlabFileTreeItem, GitlabService} from '../services/Gitlab.service'
import {win} from '../utils/common'
import {useStorage} from '@/common/utils/common'
import DynamicIcon from './DynamicIcon'
import {getTextSize} from '@/common/utils/style'
import GitlabFileViewer from './GitlabFileViewer.vue'
import type {ElTree} from 'element-plus'
import type {TreeNodeData} from 'element-plus/es/components/tree/src/tree.type'
import {Unlock, Lock, FullScreen} from '@element-plus/icons-vue'
import {useGitlabFileTreeDin} from '../hooks/useGitlabFileTreeDin'
import GitlabSearch from './GitlabSearch.vue'

// 文件树 vue 实例
const fileTreeRef = ref<InstanceType<typeof ElTree>>()

// viewer 实例
const fileViewerRef = ref<InstanceType<typeof GitlabFileViewer>>()

// 文件搜索关键词
const fileNameKeywords = ref('')

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
  // 抽屉内容 dom
  const drawerBodyDom = document.querySelector<HTMLElement>(`.${drawerBodyClassName}`)
  if (!drawerBodyDom) return

  // 监听鼠标移出抽屉时，关闭抽屉
  useEventListener(
    drawerBodyDom,
    'mouseleave',
    () => {
      if (drawerVisible.value && isDrawerOpened.value && !isDin.value) {
        drawerVisible.value = false
      }
    },
    false
  )

  // 鼠标点击抽屉内容区域外时，关闭抽屉
  onClickOutside(drawerBodyDom, () => {
    if (drawerVisible.value && !isDin.value) {
      drawerVisible.value = false
    }
  })
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

// 文件树容器最大宽度（也就是抽屉最大宽度）
const fileTreeContainerMaxWidth = ref(300)

// 是否固定在侧边
const {isDin} = useGitlabFileTreeDin({
  drawerWidth: fileTreeContainerMaxWidth
})

// gitlab service
const gitlabService = GitlabService.getInstance()

// 临时状态存储
const [getState, saveState, removeState] = useStorage('segi-gitlab-file-tree-temp-state', 'session')

// 临时状态
const gitlabFileTreeTempState = reactive({
  fileNameKeywords, // 文件搜索关键词
  fileTree, // 文件树
  drawerVisible, // 抽屉是否显示
  isDrawerOpened, // 抽屉是否已打开
  drawerContentScrollTop: 0 // 抽屉内容区域滚动条位置
})

/**
 * 获取文件树容器最大宽度（也就是抽屉最大宽度）
 * @param options.fileTree 文件树
 * @param options.min 最小宽度
 * @param options.max 最大宽度
 * @param defaultWidth 默认宽度
 */
function findFileTreeContainerMaxWidth(options: {
  fileTree: GitlabFileTreeItem[]
  min?: number
  max?: number
  defaultWidth?: number
}) {
  const {fileTree, min = 200, max = Infinity, defaultWidth = 300} = options

  // 文件节点最大深度
  let maxDepth = 0

  // 最大深度的文件节点信息
  let maxDepthNode: GitlabFileTreeItem

  // 右边三角展开收缩 icon 宽度
  const expandedIconWidth = 24

  // 文件夹图标宽度
  const fileIconWidth = 14 + 8

  // drawer padding 宽度
  // 14 为滚动条宽
  const containerPadding = 14 + 16

  // 遍历所有节点
  gitlabService.traverseFileTree(fileTree, (item: GitlabFileTreeItem, depth: number) => {
    if (!maxDepthNode) {
      maxDepthNode = item
    }

    if (depth > maxDepth) {
      // 如果当前深度大于历史最大深度
      maxDepth = depth
      maxDepthNode = item
    }

    if (depth === maxDepth) {
      // 如果当前深度等于历史最大深度
      if (item.name.length > maxDepthNode.name.length) {
        // 如果本节点比同级节点文字更长，则替换为此节点
        maxDepthNode = item
      }
    }
  })

  // 没节点返回默认宽度
  if (!maxDepthNode!) return defaultWidth

  // 最深节点的文字宽度
  const textWidth = getTextSize(maxDepthNode.name).width

  // 计算总宽度，补个 10 px 防止意外
  const calcWidth = expandedIconWidth * (maxDepth + 1) + fileIconWidth + textWidth + containerPadding + 10

  // 返回最终宽度
  return Math.min(Math.max(calcWidth, min), max)
}

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
 * 获取抽屉内容区域滚动条位置
 */
function getDrawerContentScrollTop(): number {
  const contentEl = document.querySelector<HTMLElement>(`.${drawerBodyClassName} .el-drawer__body`)
  if (!contentEl) return 0
  return contentEl.scrollTop
}

/**
 * 滚动到抽屉内容区域指定位置
 */
function setDrawerContentScrollTop(scrollTop: number) {
  const contentEl = document.querySelector<HTMLElement>(`.${drawerBodyClassName} .el-drawer__body`)
  if (!contentEl) return
  contentEl.scrollTop = scrollTop
}

/**
 * 保存临时状态
 */
function saveTempState() {
  // 保存滚动条位置
  gitlabFileTreeTempState.drawerContentScrollTop = getDrawerContentScrollTop()
  saveState(gitlabFileTreeTempState)
}

/**
 * 恢复临时状态
 */
function recoverTempState() {
  const state = getState()
  if (state) {
    // 恢复状态值
    Object.assign(gitlabFileTreeTempState, state)

    // 等页面渲染完成后再恢复滚动条位置
    nextTick().then(() => {
      setDrawerContentScrollTop(state.drawerContentScrollTop)
    })
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

/**
 * 文件节点过滤函数
 */
function filterFileNode(value: String, data: TreeNodeData): boolean {
  if (!value) return true
  return data.label.includes(value)
}

// 点击了全屏图标
function handleFullscreenClick() {
  fileViewerRef.value!.isFullscreen = !fileViewerRef.value?.isFullscreen
}

// 点击了固定或解锁固定图标
function handleDinClick() {
  isDin.value = !isDin.value
}

watch(
  isDin,
  val => {
    nextTick().then(() => {
      // 开启了固定，则抽屉永远为打开状态
      if (val) drawerVisible.value = true
    })
  },
  {
    immediate: true
  }
)

/**
 * 如果关键词改变，则调用文件树 vue 实例 filter 方法传进最新的值，执行 filter 流程
 * 上帝，这里一定要防抖，不然计算量太大
 */
watchDebounced(
  fileNameKeywords,
  val => {
    fileTreeRef.value?.filter?.(val)
  },
  {
    debounce: 500
  }
)

// 如果文件树存在，则查找当前文件节点
watch(
  () => fileTree.value?.length,
  val => {
    if (val) {
      console.log('gitlabService all tree', fileTree.value)

      // 获取抽屉宽度
      fileTreeContainerMaxWidth.value = findFileTreeContainerMaxWidth({
        fileTree: fileTree.value ?? []
      })

      // 获取当前页面文件所处节点
      currentFileNode.value = findCurrentFileNode(fileTree?.value ?? [])
      if (currentFileNode.value) {
        // 如果找到了当前节点，则展开树
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

<style>
.segi-gitlab-tree .el-drawer__header {
  padding-bottom: 20px;
  margin: 0;
}

.segi-gitlab-tree .el-drawer__body {
  padding: 0 8px 1rem;
}

.segi-gitlab-tree-popover.el-popover.el-popper {
  width: auto;
  min-width: auto;
  padding: 8px;
  border: none;
  border-radius: 8px;
}

/** 移除 drawer shadow 和动画 */
.segi-gitlab-tree-drawer-body-isDin {
  box-shadow: none !important;
  transition: none !important;
}

.segi-gitlab-tree-drawer-modal-isDin {
  top: 0 !important;
  right: auto !important;
  bottom: auto !important;
  left: 0 !important;
  width: var(--drawer-width) !important;
  height: 100vh !important;
}
</style>
