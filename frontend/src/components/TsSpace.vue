<script setup lang="ts">
import { computed } from 'vue'
import type { SpaceProps } from '@/core/types'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<SpaceProps & { css?: Record<string, any> }>(), {
  direction: 'horizontal',
  size: 'default',
  wrap: false,
  fill: false
})

const sizeMap: Record<string, string> = {
  small: 'gap-2',
  default: 'gap-3',
  large: 'gap-4'
}

const gapClass = computed(() => {
  if (typeof props.size === 'number') return ''
  return sizeMap[props.size ?? 'default']
})

const gapStyle = computed(() => {
  if (typeof props.size === 'number') return { gap: `${props.size}px` }
  return {}
})

const alignMap: Record<string, string> = {
  center: 'items-center',
  start: 'items-start',
  end: 'items-end',
  baseline: 'items-baseline',
  stretch: 'items-stretch'
}
</script>

<template>
  <div
    :class="cn(
      'flex',
      props.direction === 'vertical' ? 'flex-col' : 'flex-row',
      props.wrap ? 'flex-wrap' : '',
      props.fill ? 'w-full [&>*]:w-full' : '',
      gapClass,
      alignMap[props.alignment ?? 'center']
    )"
    :style="{ ...gapStyle, ...props.css }"
  >
    <slot />
  </div>
</template>
