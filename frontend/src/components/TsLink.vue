<script setup lang="ts">
import { computed } from 'vue'
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

const isInternal = computed(() => props.href?.startsWith('/'))

const linkClasses = computed(() => cn(
  'inline-flex items-center gap-1 transition-colors cursor-pointer',
  typeColorMap[props.type ?? 'primary'],
  props.underline ? 'hover:underline' : 'no-underline'
))
</script>

<template>
  <router-link
    v-if="isInternal"
    :to="props.href!"
    :class="linkClasses"
    :style="props.css"
  >
    {{ props.content }}
    <slot />
  </router-link>
  <a
    v-else
    :href="props.href"
    :class="linkClasses"
    :style="props.css"
  >
    {{ props.content }}
    <slot />
  </a>
</template>
