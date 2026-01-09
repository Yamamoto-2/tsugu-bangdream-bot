<script setup lang="ts">
import type { SkeletonProps } from '@/core/types'

const props = withDefaults(defineProps<SkeletonProps>(), {
  rows: 3,
  animated: true,
  loading: true
})
</script>

<template>
  <el-skeleton
    :rows="props.rows"
    :animated="props.animated"
    :loading="props.loading"
  >
    <template #default>
      <slot />
    </template>
  </el-skeleton>
</template>
