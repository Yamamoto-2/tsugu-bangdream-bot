<script setup lang="ts">
import type { TableProps } from '@/core/types'
import { cn } from '@/lib/utils'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table'

const props = withDefaults(defineProps<TableProps & { css?: Record<string, any> }>(), {
  stripe: true,
  border: false,
  size: 'default',
  showHeader: true
})
</script>

<template>
  <div class="w-full" :style="props.css">
    <div
      class="relative w-full overflow-auto"
      :style="props.maxHeight ? { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight } : {}"
    >
      <Table :class="cn(props.border ? 'border' : '')">
        <TableHeader v-if="props.showHeader">
          <TableRow>
            <TableHead
              v-for="col in props.columns"
              :key="col.prop"
              :style="{
                width: col.width ? (typeof col.width === 'number' ? `${col.width}px` : col.width) : undefined,
                minWidth: col.minWidth ? (typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth) : undefined,
                textAlign: col.align
              }"
            >
              {{ col.label }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="(row, rowIndex) in props.data"
            :key="rowIndex"
            :class="cn(props.stripe && rowIndex % 2 === 1 ? 'bg-muted/50' : '')"
          >
            <TableCell
              v-for="col in props.columns"
              :key="col.prop"
              :style="{ textAlign: col.align }"
            >
              {{ row[col.prop] }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <slot />
  </div>
</template>
