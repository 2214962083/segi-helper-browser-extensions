<template>
  <div class="w-full h-full flex flex-col">
    <div
      v-for="(card, i) in cards"
      :key="i"
      class="card border-b border-gray-100 flex-shrink-0 h-12 flex items-center justify-between"
    >
      <div class="card-left">
        <div v-if="card.type === 'logo'" class="rounded-full w-8 h-8">
          <img src="/icons/icon128.png" alt="logo" />
        </div>
        <div v-else>
          {{ card.left }}
        </div>
      </div>
      <div class="card-right">
        {{ card.right }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import pkg from '@/../package.json'

interface Card {
  type?: 'logo' | 'text'
  left: string
  right: string
}

const cards = ref<Card[]>([
  {
    type: 'logo',
    left: '',
    right: pkg.displayName
  },
  {
    left: '版本',
    right: pkg.version
  },
  {
    left: '作者',
    right: '为了防止 bug 汇报过多，作者已匿名'
  }
])
</script>

<style scoped></style>
