<template>
  <div class="segi-code-viewer" v-html="renderHtml"></div>
</template>

<script setup lang="ts">
import {getTextBytes, sendMessageToCurrentTab, toastError} from '@/common/utils/common'
import {WebextMessageId} from '@/common/utils/message-types'
import {getHighlighter, Lang, setCDN, Theme} from 'shiki'
import {computed, PropType, ref, watch} from 'vue'
import {allSupportsLangs, findLangsShouldLoad, langNameMap} from '../utils/shiki-utils'

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

const emit = defineEmits<{
  (name: 'rendered'): void
}>()

/**
 * shiki 资源 fetch base url
 */
const shikiCdn = ref('')

// 是否展示代码
const showCodeViewer = computed(
  // 代码存在、语言支持、代码文本大小不超过 50 kb（太大会卡）
  () =>
    Boolean(props.code) &&
    !isBlackListLang(props.lang) &&
    allSupportsLangs.includes(props.lang) &&
    getTextBytes(props.code) < 1024 * 50
)

// 是否处于黑名单语言，黑名单不解析
function isBlackListLang(lang: Lang) {
  const fullLanguageName = langNameMap.get(lang)

  // markdown 就用 gitlab 默认解析
  const blackList: Lang[] = ['markdown']
  return blackList.includes(fullLanguageName!)
}

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
  if (!showCodeViewer.value) return ''

  const lang = props.lang

  // 初始化 shiki cdn url
  await initShikiCdn()

  const langs = findLangsShouldLoad(lang)
  console.log('langs', langs, lang)
  const highlighter = await getHighlighter({
    theme: props.theme || 'dark-plus',
    langs
  })

  const html = highlighter.codeToHtml(code, {
    lang
  })

  emit('rendered')

  return html
}

const renderHtml = ref('')

watch(
  () => props.code,
  async code => {
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
