<script setup lang="ts">
import {fetchFileRaw} from '@/common/apis/gitlab'
import {watchDebounced} from '@vueuse/core'
import {App, computed, watch, createApp, ref, defineComponent, h} from 'vue'
import {getFileExtNameFromFilePath} from '../utils/file-icon-utils'
import CodeViewer from './CodeViewer.vue'
import {Lang} from 'shiki'
import {win} from '../utils/common'
import {allSupportsLangs} from '../utils/shiki-utils'
import {getTextBytes} from '@/common/utils/common'

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
const shikiLanguages = allSupportsLangs

// 是否展示代码
const showCodeViewer = computed(
  // 代码存在、语言支持、代码文本大小不超过 50 kb（太大会卡）
  () => Boolean(code.value) && shikiLanguages.includes(lang.value) && getTextBytes(code.value) < 1024 * 50
)

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

// code viewer 注入函数
function useInsertCodeViewer() {
  // 原来的 gitlab file 显示区域
  const targetEl = win.document.querySelector<HTMLElement>('.blob-viewer')
  if (!targetEl) return {}
  targetEl.style.position = 'relative'

  // vue 容器 element id
  const mountedElId = 'segi-gitlab-file-viewer-mount-el'

  // vue 实例
  let app: App | undefined

  // vue 容器 element
  let mountedEl = document.querySelector<HTMLElement>(`#${mountedElId}`)

  // 插入 code viewer
  const insert = () => {
    if (!mountedEl) {
      // 如果不存在 vue 容器，则创建一个
      mountedEl = win.document.createElement('div')
      mountedEl.id = mountedElId
      targetEl.appendChild(mountedEl)
    } else {
      mountedEl.innerHTML = '' // 如果挂载了 vue 实例，则清空
    }

    // 盖在原来的 gitlab file 显示区域上
    Object.assign(mountedEl.style, {
      width: '100%',
      height: '100%',
      backgroundColor: '#fff',
      position: 'absolute',
      top: '0',
      left: '0',
      zIndex: '99'
    } as Partial<CSSStyleDeclaration>)

    // 创建 vue 实例
    app = createApp(
      defineComponent({
        name: 'App',
        data() {
          return {
            code: code.value,
            lang: lang.value
          }
        },
        render() {
          return h(CodeViewer, {
            code: this.code,
            lang: this.lang
          })
        }
      })
    )

    // 挂载 vue 实例
    app?.mount(mountedEl)
  }

  // 删除 code viewer
  const remove = () => {
    if (app) app.unmount()
    app = undefined
    mountedEl?.remove()
    mountedEl = null
  }

  return {
    insert,
    remove
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const {insert: insertCodeViewer, remove: removeCodeViewer} = useInsertCodeViewer()

watch(
  showCodeViewer,
  val => {
    // 如果需要显示，则插入 code viewer
    val && insertCodeViewer?.() //: removeCodeViewer?.()
  },
  {
    immediate: true
  }
)

// 监听 props 更新
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
