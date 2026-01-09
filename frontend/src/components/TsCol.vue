<script setup lang="ts">
import type { ColProps } from '@/core/types'

const props = withDefaults(defineProps<ColProps>(), {
  span: 24
})
</script>

<template>
  <el-col
    :span="props.span"
    :offset="props.offset"
    :push="props.push"
    :pull="props.pull"
    :xs="props.xs"
    :sm="props.sm"
    :md="props.md"
    :lg="props.lg"
    :xl="props.xl"
  >
    <slot />
  </el-col>
</template>
