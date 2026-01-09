<script setup lang="ts">
import type { TextProps } from '@/core/types'

const props = withDefaults(defineProps<TextProps>(), {
  size: 'default',
  tag: 'span'
})
</script>

<template>
  <el-text
    :type="props.type"
    :size="props.size"
    :tag="props.tag"
    :truncated="props.truncated"
    :line-clamp="props.lineClamp"
  >
    {{ props.content }}
    <slot />
  </el-text>
</template>
