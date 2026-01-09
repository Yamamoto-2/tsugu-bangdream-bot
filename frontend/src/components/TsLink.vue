<script setup lang="ts">
import type { LinkProps } from '@/core/types'

const props = withDefaults(defineProps<LinkProps>(), {
  type: 'primary',
  underline: true
})
</script>

<template>
  <el-link
    :type="props.type"
    :underline="props.underline"
    :href="props.href"
  >
    <el-icon v-if="props.icon">
      <component :is="props.icon" />
    </el-icon>
    {{ props.content }}
    <slot />
  </el-link>
</template>
