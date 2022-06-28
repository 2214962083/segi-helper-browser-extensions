<template>
  <Highlight autodetect v-bind="$attrs" :code="code" />
</template>

<script setup lang="ts">
import highlightjs from '@highlightjs/vue-plugin'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/stackoverflow-light.css'

hljs.registerLanguage('json', json)
const Highlight = highlightjs.component

defineProps({
  code: {
    type: String,
    default: () => ''
  }
})
</script>
