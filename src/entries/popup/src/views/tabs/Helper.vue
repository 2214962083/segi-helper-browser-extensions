<template>
  <div class="w-full h-full flex flex-col overflow-y-auto">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="本扩展有什么功能" name="1">
        <ul>
          <li class="mb-4">1、在浏览 uhomecp 时，可以鼠标 hover 菜单并预览菜单。</li>
          <li class="mb-4">
            2、在浏览 uhomecp 时，可以按 ctrl + k 键呼出全局搜索，可以根据菜单名字或菜单 url 搜索菜单。
          </li>
          <li class="mb-4">
            3、在浏览 uhomecp 时，可以按点击顶部 tab 左侧分享 icon 复制分享代码给队友打开同样的 tab。
          </li>
          <li class="mb-4">4、在浏览 gitlab 时，可以按 ctrl + k 呼出全局搜索，可以搜仓库或当前仓库文件。</li>
          <li class="mb-4">
            5、在浏览 gitlab 某个仓库时，会在左侧生成文件侧栏树，方便浏览文件，并且使用 vscode
            同款染色代码，可以点击侧栏左上角固定侧栏或全屏浏览代码
          </li>
          <li class="mb-4">
            6、在浏览 doclever api 平台时，可以按 ctrl + k 键呼出全局搜索，可以根据接口名字或接口 url 搜索接口。
          </li>
        </ul>
      </el-collapse-item>
      <el-collapse-item title="全局搜索快捷键小技巧" name="2">
        <ul>
          <li class="mb-4">1、可以按 ctrl + k 呼出全局搜索</li>
          <li class="mb-4">2、可以按 tab 键向右切换搜索 tab</li>
          <li class="mb-4">3、可以按 shift + tab 键向左切换搜索 tab</li>
          <li class="mb-4">4、可以按上下键在搜索结果移动</li>
          <li class="mb-4">5、可以按 enter 键确认选择搜索结果</li>
          <li class="mb-4">6、按 Esc 键或再次按 ctrl + k 可以关闭全局搜索</li>
        </ul>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const activeNames = ref<string[]>(['1'])
</script>

<style scoped></style>
