<script setup lang="ts">
import { computed } from 'vue'
import type { ProgressProps } from '@/core/types'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

const props = withDefaults(defineProps<ProgressProps & { css?: Record<string, any> }>(), {
  percentage: 0,
  type: 'line',
  strokeWidth: 6,
  showText: true
})

const statusColorMap: Record<string, string> = {
  success: '[&>[data-slot=progress-indicator]]:bg-green-500',
  exception: '[&>[data-slot=progress-indicator]]:bg-red-500',
  warning: '[&>[data-slot=progress-indicator]]:bg-yellow-500'
}

const progressColor = computed(() => {
  if (typeof props.color === 'string') return props.color
  return undefined
})

const displayText = computed(() => {
  if (props.format) return props.format(props.percentage ?? 0)
  return `${props.percentage}%`
})
</script>

<template>
  <div class="w-full flex items-center gap-2" :style="props.css">
    <Progress
      :model-value="props.percentage"
      :class="cn(props.status ? statusColorMap[props.status] : '')"
      :style="{
        height: `${props.strokeWidth}px`,
        ...(progressColor ? { '--tw-progress-color': progressColor } : {})
      }"
    />
    <span v-if="props.showText" class="text-sm text-muted-foreground whitespace-nowrap">
      {{ displayText }}
    </span>
  </div>
</template>
