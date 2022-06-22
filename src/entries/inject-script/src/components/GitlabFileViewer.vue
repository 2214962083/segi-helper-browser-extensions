<template>
  <div class="segi-gitlab-file-viewer">
    <CodeViewer v-if="showCodeViewer" :code="code" :lang="lang"></CodeViewer>
  </div>
</template>

<script setup lang="ts">
import {fetchFileRaw} from '@/common/apis/gitlab'
import {watchDebounced} from '@vueuse/core'
import {App, computed, watch, createApp, ref} from 'vue'
import {getFileExtNameFromFilePath} from '../utils/file-icon-utils'
import CodeViewer from './CodeViewer.vue'
import {BUNDLED_LANGUAGES, Lang} from 'shiki'
import {win} from '../utils/common'

const props = defineProps({
  /**
   * 仓库名称，比如 xxx/share-docs
   */
  repoName: {
    type: String
  },

  /**
   * 仓库分支，比如 master
   */
  branchName: {
    type: String,
    default: 'master'
  },

  /**
   * 文件路径
   */
  path: {
    type: String
  }
})

// 当前文件代码
const code = ref('')

// 当前文件代码语言
const lang = ref<Lang>('' as Lang)

// shiki 支持的语言
const shikiLanguages = BUNDLED_LANGUAGES.map(lang => lang.id)

// 是否展示代码
const showCodeViewer = computed(() => Boolean(code.value) && shikiLanguages.includes(lang.value))

// 更新 code
async function updateCode() {
  const {repoName, branchName, path} = props
  if (!repoName || !path || !branchName) return

  // 获取文件原始值
  const raw = await fetchFileRaw({
    repoName: repoName,
    branchName: branchName,
    path: path
  })

  // 如果是文本，则保存到 code
  if (typeof raw === 'string') code.value = raw
}

function useInsertCodeViewer() {
  const targetEl = win.document.querySelector<HTMLElement>('.blob-viewer')
  if (!targetEl) return {}
  targetEl.style.position = 'relative'

  let app: App | undefined
  let mountedEl: HTMLElement | undefined

  const show = () => {
    mountedEl = win.document.createElement('div')
    Object.assign(mountedEl.style, {
      width: '100%',
      position: 'absolute',
      top: '0',
      left: '0',
      zIndex: '99'
    } as Partial<CSSStyleDeclaration>)

    app = createApp({
      components: {
        CodeViewer
      },
      data() {
        return {
          code: code.value,
          lang: lang.value
        }
      },
      template: `
    <CodeViewer :code="code" :lang="lang"></CodeViewer>
    `
    })
    app?.mount(mountedEl)
  }

  const remove = () => {
    if (app) app.unmount()
    app = undefined
    mountedEl?.remove()
    mountedEl = undefined
  }

  return {
    show,
    remove
  }
}

const {show, remove} = useInsertCodeViewer()

watch(showCodeViewer, val => {
  val ? show?.() : remove?.()
})

watchDebounced(
  () => JSON.stringify(props),
  () => {
    // 设置语言
    lang.value =
      (getFileExtNameFromFilePath(props.path ?? '')
        .split('.')
        .pop() as Lang) ?? ('' as Lang)

    // 更新代码
    updateCode()
  },
  {
    immediate: true,
    debounce: 300
  }
)
</script>
