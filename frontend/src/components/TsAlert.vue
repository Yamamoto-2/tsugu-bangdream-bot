<script setup lang="ts">
import type { AlertProps } from '@/core/types'

const props = withDefaults(defineProps<AlertProps>(), {
  type: 'info',
  effect: 'light',
  closable: true,
  showIcon: true
})
</script>

<template>
  <el-alert
    :title="props.title"
    :description="props.description"
    :type="props.type"
    :effect="props.effect"
    :closable="props.closable"
    :show-icon="props.showIcon"
  />
</template>
