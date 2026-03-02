<script setup lang="ts">
import type { TitleProps } from '@/core/types'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<TitleProps & { css?: Record<string, any> }>(), {
  level: 2
})

const Tag = `h${props.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const levelClassMap: Record<number, string> = {
  1: 'text-2xl md:text-[28px]',
  2: 'text-xl md:text-2xl',
  3: 'text-lg md:text-xl',
  4: 'text-base md:text-lg',
  5: 'text-base',
  6: 'text-sm'
}
</script>

<template>
  <component
    :is="Tag"
    :class="cn(
      'mb-4 font-semibold text-foreground',
      levelClassMap[props.level ?? 2]
    )"
    :style="props.css"
  >
    {{ props.content }}
    <slot />
  </component>
</template>
