<script setup lang="ts">
import type { DividerProps } from '@/core/types'
import { Separator } from '@/components/ui/separator'

const props = withDefaults(defineProps<DividerProps & { css?: Record<string, any> }>(), {
  direction: 'horizontal',
  contentPosition: 'center',
  borderStyle: 'solid'
})
</script>

<template>
  <div
    v-if="$slots.default"
    class="flex items-center gap-3 my-4"
    :class="{ 'flex-col': props.direction === 'vertical' }"
    :style="props.css"
  >
    <Separator v-if="props.contentPosition !== 'left'" class="flex-1" :orientation="props.direction" />
    <span class="text-muted-foreground text-sm whitespace-nowrap">
      <slot />
    </span>
    <Separator v-if="props.contentPosition !== 'right'" class="flex-1" :orientation="props.direction" />
  </div>
  <Separator
    v-else
    class="my-4"
    :orientation="props.direction"
    :style="props.css"
  />
</template>
