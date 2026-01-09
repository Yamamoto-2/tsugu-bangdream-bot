<script setup lang="ts">
import type { TagProps } from '@/core/types'

const props = withDefaults(defineProps<TagProps>(), {
  effect: 'light',
  size: 'default',
  round: false
})
</script>

<template>
  <el-tag
    :type="props.type"
    :effect="props.effect"
    :size="props.size"
    :round="props.round"
  >
    {{ props.content }}
    <slot />
  </el-tag>
</template>
