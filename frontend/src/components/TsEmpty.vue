<script setup lang="ts">
import type { EmptyProps } from '@/core/types'

const props = withDefaults(defineProps<EmptyProps>(), {
  description: '暂无数据'
})
</script>

<template>
  <el-empty
    :description="props.description"
    :image="props.image"
    :image-size="props.imageSize"
  >
    <slot />
  </el-empty>
</template>
