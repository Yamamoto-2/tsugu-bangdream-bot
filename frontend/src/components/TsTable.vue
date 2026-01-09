<script setup lang="ts">
import type { TableProps } from '@/core/types'

const props = withDefaults(defineProps<TableProps>(), {
  stripe: true,
  border: false,
  size: 'default',
  showHeader: true
})
</script>

<template>
  <el-table
    :data="props.data"
    :stripe="props.stripe"
    :border="props.border"
    :size="props.size"
    :show-header="props.showHeader"
    :max-height="props.maxHeight"
    class="ts-table"
  >
    <el-table-column
      v-for="col in props.columns"
      :key="col.prop"
      :prop="col.prop"
      :label="col.label"
      :width="col.width"
      :min-width="col.minWidth"
      :align="col.align"
      :fixed="col.fixed"
    />
    <slot />
  </el-table>
</template>

<style scoped>
.ts-table {
  width: 100%;
}
</style>
