<script setup lang="ts">
import { computed } from 'vue'
import type { RowProps } from '@/core/types'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<RowProps & { css?: Record<string, any> }>(), {
  gutter: 20,
  justify: 'start',
  align: 'top'
})

const justifyMap: Record<string, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  'space-around': 'justify-around',
  'space-between': 'justify-between',
  'space-evenly': 'justify-evenly'
}

const alignMap: Record<string, string> = {
  top: 'items-start',
  middle: 'items-center',
  bottom: 'items-end'
}

const rowStyle = computed(() => ({
  gap: `${props.gutter}px`,
  ...props.css
}))
</script>

<template>
  <div
    :class="cn('flex flex-wrap', justifyMap[props.justify ?? 'start'], alignMap[props.align ?? 'top'])"
    :style="rowStyle"
  >
    <slot />
  </div>
</template>
