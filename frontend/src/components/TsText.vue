<script setup lang="ts">
import { computed } from 'vue'
import type { TextProps } from '@/core/types'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<TextProps & { css?: Record<string, any> }>(), {
  size: 'default',
  tag: 'span'
})

const typeColorMap: Record<string, string> = {
  primary: 'text-primary',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  info: 'text-muted-foreground'
}

const sizeClassMap: Record<string, string> = {
  large: 'text-base',
  default: 'text-sm',
  small: 'text-xs'
}

const truncateStyle = computed(() => {
  if (props.lineClamp) {
    return {
      display: '-webkit-box',
      WebkitLineClamp: props.lineClamp,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden'
    }
  }
  return {}
})
</script>

<template>
  <component
    :is="props.tag"
    :class="cn(
      sizeClassMap[props.size ?? 'default'],
      typeColorMap[props.type ?? ''] ?? '',
      props.truncated ? 'truncate' : ''
    )"
    :style="{ ...truncateStyle, ...props.css }"
  >
    {{ props.content }}
    <slot />
  </component>
</template>
