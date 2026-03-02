<script setup lang="ts">
import { computed } from 'vue'
import type { ColProps } from '@/core/types'

const props = withDefaults(defineProps<ColProps & { css?: Record<string, any> }>(), {
  span: 24
})

function spanToPercent(span: number | undefined): string | undefined {
  if (span === undefined) return undefined
  return `${(span / 24) * 100}%`
}

const colStyle = computed(() => {
  const style: Record<string, any> = {}
  if (props.span !== undefined) {
    const w = spanToPercent(props.span)
    style.width = w
    style.maxWidth = w
    style.flexBasis = w
  }
  if (props.offset) {
    style.marginLeft = spanToPercent(props.offset)
  }
  return { ...style, ...props.css }
})
</script>

<template>
  <div :style="colStyle">
    <slot />
  </div>
</template>
