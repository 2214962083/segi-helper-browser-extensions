<script setup lang="ts">
import {fetchFileRaw} from '@/common/apis/gitlab'
import {watchDebounced} from '@vueuse/core'
import {computed, ref} from 'vue'
import {getFileExtNameFromFilePath} from '../utils/file-icon-utils'
import {Lang} from 'shiki'
import {useGitlabViewerFullscreen} from '../hooks/useGitlabViewerFullscreen'
import {usMountGitlabCodeViewer} from '../hooks/usMountGitlabCodeViewer'

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
  },

  /**
   * 是否是固定 drawer
   */
  isDin: {
    type: Boolean,
    default: false
  },

  /**
   * drawer 宽度
   */
  drawerWidth: {
    type: Number,
    default: 300
  }
})

// 当前文件代码
const code = ref('')

// 当前文件代码语言
const lang = ref<Lang>('' as Lang)

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

usMountGitlabCodeViewer({
  code,
  lang
})

const {isFullscreen} = useGitlabViewerFullscreen({
  marginLeft: computed(() => {
    return props.isDin ? props.drawerWidth : 0
  })
})

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

defineExpose({
  isFullscreen
})
</script>
