<script setup lang="ts">
import type { SpaceProps } from '@/core/types'

const props = withDefaults(defineProps<SpaceProps>(), {
  direction: 'horizontal',
  size: 'default',
  wrap: false,
  fill: false
})
</script>

<template>
  <el-space
    :direction="props.direction"
    :size="props.size"
    :wrap="props.wrap"
    :fill="props.fill"
    :alignment="props.alignment"
    :class="{ 'ts-space-fill': props.fill }"
  >
    <slot />
  </el-space>
</template>

<style scoped>
.ts-space-fill {
  width: 100%;
}

.ts-space-fill :deep(.el-space__item) {
  width: 100%;
}
</style>
