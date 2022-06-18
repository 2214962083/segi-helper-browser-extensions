<template>
  <div
    class="w-full p-3 border-gray-200 flex items-center justify-between"
    :class="{
      'border-b': showBorder
    }"
  >
    <el-popover :width="400" title="菜单数据" trigger="hover" :fallback-placements="['bottom', 'top', 'right', 'left']">
      <template #reference>
        <div class="mr-8">
          {{ menu.pathName }}
        </div>
      </template>
      <template #default>
        <Code :code="getShowMenuText(menu)"></Code>
      </template>
    </el-popover>
    <div class="flex flex-shrink-0">
      <el-button size="small" type="primary" @click="openUhomecpMenuPage(menu)">打开</el-button>
      <el-button class="ml-2" size="small" @click="focusUhomecpMenu(menu)">聚焦</el-button>
      <el-button class="ml-2" size="small" @click="collectUhomecpMenu(menu)">
        <el-icon>
          <Star />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {UhomecpMenu} from '@/entries/content-script/src/utils/uhomecp-menu'
import {CollectMenuService} from '@/entries/popup/src/services/CollectMenu.service'
import {PropType} from 'vue'
import {deleteNilKeys, sendMessageToCurrentTab} from '../utils/common'
import {WebextMessageId} from '../utils/message-types'
import {Star} from '@element-plus/icons-vue'
import Code from './Code.vue'

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
    'content-script'
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
    'content-script'
  )
}

/**
 * 收藏该菜单
 */
async function collectUhomecpMenu(menu: UhomecpMenu) {
  const co = CollectMenuService.getInstance()
  await co.init()
  await co.addMenu(menu)
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
