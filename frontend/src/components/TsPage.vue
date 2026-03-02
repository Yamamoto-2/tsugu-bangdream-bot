<script setup lang="ts">
import type { PageProps } from '@/core/types'

const props = withDefaults(defineProps<PageProps & { css?: Record<string, any> }>(), {
  padding: '20px'
})
</script>

<template>
  <div
    class="min-h-screen bg-muted"
    :style="{
      background: props.background,
      padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding,
      ...props.css
    }"
  >
    <slot />
  </div>
</template>
