<script setup lang="ts">
import type { DividerProps } from '@/core/types'

const props = withDefaults(defineProps<DividerProps>(), {
  direction: 'horizontal',
  contentPosition: 'center',
  borderStyle: 'solid'
})
</script>

<template>
  <el-divider
    :direction="props.direction"
    :content-position="props.contentPosition"
    :border-style="props.borderStyle"
  >
    <slot />
  </el-divider>
</template>
