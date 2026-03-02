<script setup lang="ts">
import type { EmptyProps } from '@/core/types'
import { Empty } from '@/components/ui/empty'
import { Inbox } from 'lucide-vue-next'

const props = withDefaults(defineProps<EmptyProps & { css?: Record<string, any> }>(), {
  description: '暂无数据'
})
</script>

<template>
  <Empty :style="props.css">
    <img
      v-if="props.image"
      :src="props.image"
      :style="props.imageSize ? { width: `${props.imageSize}px` } : {}"
      class="mx-auto"
    />
    <Inbox v-else class="size-12 text-muted-foreground" />
    <p class="text-muted-foreground text-sm">{{ props.description }}</p>
    <slot />
  </Empty>
</template>
