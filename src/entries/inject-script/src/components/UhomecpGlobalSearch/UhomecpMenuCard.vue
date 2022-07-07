<template>
  <div w-full h-full flex justify-center text-14px>
    <div h-full flex-1 flex items-center>
      {{ menu.pathName }}

      <!-- hover 显示菜单 json 数据 -->
      <el-popover
        :width="400"
        popper-class="!z-999999999"
        trigger="hover"
        :fallback-placements="['bottom', 'top', 'right', 'left']"
      >
        <template #reference>
          <el-icon ml-2 mr-8 cursor-pointer :size="18">
            <WarningFilled class="text-gray-200" />
          </el-icon>
        </template>
        <template #default>
          <Code :code="getShowMenuText(menu)"></Code>
        </template>
      </el-popover>
    </div>

    <!-- 右边操作按钮区 -->
    <div flex flex-shrink-0 h-full items-center>
      <el-button class="ml-2" size="small" @click.stop="focusUhomecpMenu(menu)">聚焦</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {focusMenu, UhomecpMenu} from '@/entries/inject-script/src/utils/uhomecp-menu'
import {PropType} from 'vue'
import {WarningFilled} from '@element-plus/icons-vue'
import Code from '@/common/components/Code.vue'
import {deleteNilKeys} from '@/common/utils/common'

defineProps({
  menu: {
    type: Object as PropType<UhomecpMenu>,
    required: true
  }
})

/**
 * 聚焦该菜单
 */
async function focusUhomecpMenu(menu: UhomecpMenu) {
  return focusMenu(menu.pathName)
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
