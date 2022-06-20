<template>
  <div
    class="w-full p-3 border-gray-200 flex items-center justify-between"
    :class="{
      'border-b': showBorder
    }"
  >
    <div class="h-full flex-1 flex items-center">
      {{ menu.pathName }}

      <!-- hover 显示菜单 json 数据 -->
      <el-popover :width="400" trigger="hover" :fallback-placements="['bottom', 'top', 'right', 'left']">
        <template #reference>
          <el-icon class="ml-2 mr-8 cursor-pointer" :size="18">
            <WarningFilled class="text-gray-200" />
          </el-icon>
        </template>
        <template #default>
          <Code :code="getShowMenuText(menu)"></Code>
        </template>
      </el-popover>
    </div>

    <!-- 右边操作按钮区 -->
    <div class="flex flex-shrink-0">
      <el-button size="small" type="primary" @click="openUhomecpMenuPage(menu)">打开</el-button>
      <el-button class="ml-2" size="small" @click="focusUhomecpMenu(menu)">聚焦</el-button>
      <el-icon class="ml-2 cursor-pointer" :size="20" @click="collectUhomecpMenu(menu)">
        <StarFilled :class="[hasMenu(menu) ? 'text-yellow-500' : 'text-gray-400']" />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import {UhomecpMenu} from '@/entries/inject-script/src/utils/uhomecp-menu'
import {PropType} from 'vue'
import {deleteNilKeys, sendMessageToCurrentTab} from '../utils/common'
import {WebextMessageId} from '../utils/message-types'
import {StarFilled, WarningFilled} from '@element-plus/icons-vue'
import Code from './Code.vue'
import {useCollectMenuService} from '../hooks/useCollectMenu'

defineProps({
  menu: {
    type: Object as PropType<UhomecpMenu>,
    required: true
  },
  showBorder: {
    type: Boolean,
    default: true
  }
})

/**
 * 打开该菜单对应的页面
 */
async function openUhomecpMenuPage(menu: UhomecpMenu) {
  console.log('openUhomecpMenuPage', menu)
  await sendMessageToCurrentTab(
    WebextMessageId.openUhomecpMenuPage,
    [
      {
        url: menu.url,
        name: menu.name
      }
    ],
    'window'
  )
}

/**
 * 聚焦该菜单
 */
async function focusUhomecpMenu(menu: UhomecpMenu) {
  console.log('focusUhomecpMenu', menu)
  await sendMessageToCurrentTab(
    WebextMessageId.focusUhomecpMenu,
    [
      {
        pathName: menu.pathName
      }
    ],
    'window'
  )
}

/**
 * 收藏该菜单
 */
const {collectMenuService, hasMenu} = useCollectMenuService()

async function collectUhomecpMenu(menu: UhomecpMenu) {
  if (hasMenu(menu)) {
    await collectMenuService.removeMenu(menu)
  } else {
    await collectMenuService.addMenu(menu)
  }
}

/**
 * 获取显示的菜单详情信息文本
 */
function getShowMenuText(menu: UhomecpMenu) {
  let cloneUhomecpMenu = JSON.parse(JSON.stringify(menu))
  delete cloneUhomecpMenu.child
  delete cloneUhomecpMenu.pathName
  delete cloneUhomecpMenu.id
  cloneUhomecpMenu = deleteNilKeys(cloneUhomecpMenu)
  return JSON.stringify(cloneUhomecpMenu, null, 4)
}
</script>
