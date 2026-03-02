<script setup lang="ts">
import { computed } from 'vue'
import type { StatisticProps } from '@/core/types'

const props = defineProps<StatisticProps & { css?: Record<string, any> }>()

const formattedValue = computed(() => {
  if (props.value === undefined || props.value === null) return ''
  if (typeof props.value === 'number' && props.precision !== undefined) {
    return props.value.toFixed(props.precision)
  }
  return String(props.value)
})
</script>

<template>
  <div class="flex flex-col" :style="props.css">
    <span v-if="props.title" class="text-sm text-muted-foreground">{{ props.title }}</span>
    <span class="text-2xl font-semibold tabular-nums" :style="props.valueStyle">
      <span v-if="props.prefix" class="text-base mr-1">{{ props.prefix }}</span>
      {{ formattedValue }}
      <span v-if="props.suffix" class="text-base ml-1">{{ props.suffix }}</span>
    </span>
  </div>
</template>
