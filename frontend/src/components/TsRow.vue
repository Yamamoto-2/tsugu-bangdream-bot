<script setup lang="ts">
import type { RowProps } from '@/core/types'

const props = withDefaults(defineProps<RowProps>(), {
  gutter: 20,
  justify: 'start',
  align: 'top'
})
</script>

<template>
  <el-row
    :gutter="props.gutter"
    :justify="props.justify"
    :align="props.align"
  >
    <slot />
  </el-row>
</template>
