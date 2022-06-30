<template>
  <div class="w-full h-full flex flex-col justify-center text-12px break-words">
    <div>
      {{ doclever.fullPathName }}
    </div>
    <div class="mt-2 text-14px">
      {{ doclever.apiUrl }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {PropType} from 'vue'
import {DocleverTreeItem} from '../../services/Doclever.service'

defineProps({
  doclever: {
    type: Object as PropType<DocleverTreeItem>,
    required: true
  }
})
</script>
