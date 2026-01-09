<script setup lang="ts">
import type { ProgressProps } from '@/core/types'

const props = withDefaults(defineProps<ProgressProps>(), {
  percentage: 0,
  type: 'line',
  strokeWidth: 6,
  showText: true
})
</script>

<template>
  <div class="ts-progress">
    <el-progress
      :percentage="props.percentage"
      :type="props.type"
      :stroke-width="props.strokeWidth"
      :status="props.status"
      :color="props.color"
      :show-text="props.showText"
      :format="props.format"
    />
  </div>
</template>

<style scoped>
.ts-progress {
  width: 100%;
}
</style>
