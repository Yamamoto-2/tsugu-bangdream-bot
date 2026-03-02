<script setup lang="ts">
import type { LinkProps } from '@/core/types'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<LinkProps & { css?: Record<string, any> }>(), {
  type: 'primary',
  underline: true
})

const typeColorMap: Record<string, string> = {
  primary: 'text-primary',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  info: 'text-muted-foreground',
  default: 'text-foreground'
}
</script>

<template>
  <a
    :href="props.href"
    :class="cn(
      'inline-flex items-center gap-1 transition-colors',
      typeColorMap[props.type ?? 'primary'],
      props.underline ? 'hover:underline' : 'no-underline'
    )"
    :style="props.css"
  >
    {{ props.content }}
    <slot />
  </a>
</template>
