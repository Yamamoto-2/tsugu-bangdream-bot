<script setup lang="ts">
import type { TagProps } from '@/core/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const props = withDefaults(defineProps<TagProps & { css?: Record<string, any> }>(), {
  effect: 'light',
  size: 'default',
  round: false
})

const typeClassMap: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  danger: 'bg-red-500 text-white',
  info: 'bg-gray-500 text-white'
}

const sizeClassMap: Record<string, string> = {
  large: 'px-3 py-1 text-sm',
  default: 'px-2.5 py-0.5 text-xs',
  small: 'px-2 py-0 text-xs'
}
</script>

<template>
  <Badge
    :class="cn(
      typeClassMap[props.type ?? ''] ?? '',
      sizeClassMap[props.size ?? 'default'],
      props.round ? 'rounded-full' : 'rounded-md'
    )"
    variant="default"
    :style="props.css"
  >
    {{ props.content }}
    <slot />
  </Badge>
</template>
