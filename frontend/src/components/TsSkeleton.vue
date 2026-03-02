<script setup lang="ts">
import type { SkeletonProps } from '@/core/types'
import { Skeleton } from '@/components/ui/skeleton'

const props = withDefaults(defineProps<SkeletonProps & { css?: Record<string, any> }>(), {
  rows: 3,
  animated: true,
  loading: true
})
</script>

<template>
  <div v-if="props.loading" class="space-y-3" :style="props.css">
    <Skeleton
      v-for="i in props.rows"
      :key="i"
      class="h-4 w-full"
      :class="[
        props.animated ? 'animate-pulse' : '',
        i === props.rows ? 'w-3/5' : ''
      ]"
    />
  </div>
  <slot v-else />
</template>
