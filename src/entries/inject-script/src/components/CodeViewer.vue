<template>
  <div class="segi-code-viewer" v-html="renderHtml"></div>
</template>

<script setup lang="ts">
import {sendMessageToCurrentTab, toastError} from '@/common/utils/common'
import {WebextMessageId} from '@/common/utils/message-types'
import {getHighlighter, Lang, setCDN, Theme} from 'shiki'
import {PropType, ref, watch} from 'vue'
import {findLangsShouldLoad} from '../utils/shiki-utils'

const props = defineProps({
  /**
   * code 语言
   */
  lang: {
    type: String as PropType<Lang>,
    default: 'txt'
  },

  /**
   * code 内容
   */
  code: {
    type: String,
    default: ''
  },

  /**
   * code 主题
   */
  theme: {
    type: String as PropType<Theme>,
    default: 'dark-plus'
  }
})

/**
 * shiki 资源 fetch base url
 */
const shikiCdn = ref('')

/**
 * 初始化 shiki cdn url
 */
async function initShikiCdn() {
  if (shikiCdn.value) return
  shikiCdn.value = await sendMessageToCurrentTab(
    WebextMessageId.getExtensionResourceUrl,
    ['assets/shiki/'],
    'background'
  ).catch(err => toastError(err) && '')

  setCDN(shikiCdn.value)
}

async function createRenderCodeHtml(code: string) {
  const lang = props.lang

  // 初始化 shiki cdn url
  await initShikiCdn()

  const langs = findLangsShouldLoad(lang)
  console.log('langs', langs)
  const highlighter = await getHighlighter({
    theme: props.theme || 'dark-plus',
    langs
  })

  return highlighter.codeToHtml(code, {
    lang
  })
}

const renderHtml = ref('')

watch(
  () => props.code,
  async code => {
    if (!code) return
    renderHtml.value = await createRenderCodeHtml(code)
  },
  {
    immediate: true
  }
)
</script>

<style>
.segi-code-viewer pre {
  padding: 1rem;
}
.segi-code-viewer code {
  /** 去除 gitlab 默认的样式 */
  padding: 0;
  color: inherit;

  /**  添加行间 number */
  /**  看不懂没关系，反正是 issue copy 来的 */
  counter-reset: step;
  counter-increment: step 0;
  background-color: transparent;
  border-radius: 0;
}

.segi-code-viewer code .line {
  white-space: pre;
}

/**  添加行间 number */
/**  看不懂没关系，反正是 issue copy 来的 */
/** https://github.com/shikijs/shiki/issues/3#issuecomment-830564854 */
.segi-code-viewer code .line::before {
  display: inline-block;
  width: 2rem;
  margin-right: 1.5rem;
  color: rgba(115, 138, 148, 0.4);
  text-align: right;
  content: counter(step);
  counter-increment: step;
}
</style>
