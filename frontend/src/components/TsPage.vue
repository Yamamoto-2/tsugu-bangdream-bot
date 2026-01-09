<script setup lang="ts">
import type { PageProps } from '@/core/types'

const props = withDefaults(defineProps<PageProps>(), {
  padding: '20px'
})
</script>

<template>
  <div
    class="ts-page"
    :style="{
      background: props.background,
      padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.ts-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style>
