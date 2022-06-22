<template>
  <div v-html="renderHtml"></div>
</template>

<script setup lang="ts">
import {getHighlighter, Lang, Theme} from 'shiki'
import {PropType, ref, watch} from 'vue'

const props = defineProps({
  /**
   * code 语言
   */
  lang: {
    type: [String, Array] as PropType<Lang | Lang[]>,
    default: 'javascript'
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

async function createRenderCodeHtml(code: string) {
  const lang = Array.isArray(props.lang) ? props.lang : [props.lang]
  const highlighter = await getHighlighter({
    theme: props.theme || 'dark-plus',
    langs: lang
  })

  return highlighter.codeToHtml(code, {
    lang: lang[0]
  })
}

const renderHtml = ref('')

watch(
  () => props.code,
  async code => {
    renderHtml.value = await createRenderCodeHtml(code)
  }
)
</script>

<style scoped></style>
