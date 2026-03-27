<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TableProps, SchemaNode } from '@/core/types'
import { cn } from '@/lib/utils'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table'
import SchemaRenderer from '@/core/SchemaRenderer.vue'

const props = withDefaults(defineProps<TableProps & { css?: Record<string, any> }>(), {
  stripe: true,
  border: false,
  size: 'default',
  showHeader: true,
  expandable: false,
  defaultExpandAll: false,
})

// 展开状态管理
const expandedRows = ref<Set<number>>(new Set())

// 初始化默认展开
if (props.defaultExpandAll && props.data) {
  props.data.forEach((_, i) => expandedRows.value.add(i))
}

function isSchemaNode(val: any): val is SchemaNode {
  return val && typeof val === 'object' && typeof val.componentName === 'string'
}

function isExpandable(row: any): boolean {
  return props.expandable && Array.isArray(row._expandContent) && row._expandContent.length > 0
}

function isExpanded(index: number): boolean {
  return expandedRows.value.has(index)
}

function toggleRow(index: number) {
  const next = new Set(expandedRows.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  expandedRows.value = next
}

const totalColumns = computed(() => {
  const base = props.columns?.length ?? 0
  return props.expandable ? base + 1 : base
})

// flex 比例 → 百分比宽度
const useFlexLayout = computed(() => props.columns?.some(c => c.flex != null) ?? false)

const flexWidths = computed(() => {
  if (!useFlexLayout.value || !props.columns) return {}
  const total = props.columns.reduce((sum, c) => sum + (c.flex ?? 0), 0)
  if (total === 0) return {}
  const map: Record<string, string> = {}
  for (const col of props.columns) {
    if (col.flex != null) {
      map[col.prop] = `${(col.flex / total * 100).toFixed(2)}%`
    }
  }
  return map
})

function getColStyle(col: typeof props.columns extends (infer T)[] | undefined ? NonNullable<T> : never) {
  // flex 优先，其次 width/minWidth
  if (useFlexLayout.value && flexWidths.value[col.prop]) {
    return {
      width: flexWidths.value[col.prop],
      textAlign: col.align,
    }
  }
  return {
    width: col.width ? (typeof col.width === 'number' ? `${col.width}px` : col.width) : undefined,
    minWidth: col.minWidth ? (typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth) : undefined,
    textAlign: col.align,
  }
}

function getCellAlignClass(align?: string) {
  if (align === 'center') return 'cell-center'
  if (align === 'right') return 'cell-right'
  return ''
}
</script>

<template>
  <div
    class="w-full"
    :style="{
      ...props.css,
      ...(props.maxHeight ? { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight, overflow: 'auto' } : {})
    }"
  >
      <Table :class="cn(props.border ? 'border' : '', useFlexLayout ? 'table-fixed w-full' : '')">
        <colgroup v-if="useFlexLayout">
          <col v-if="props.expandable" style="width: 40px" />
          <col v-for="col in props.columns" :key="col.prop" :style="{ width: flexWidths[col.prop] }" />
        </colgroup>
        <TableHeader v-if="props.showHeader">
          <TableRow>
            <TableHead v-if="props.expandable" class="w-10" />
            <TableHead
              v-for="col in props.columns"
              :key="col.prop"
              :style="getColStyle(col)"
            >
              {{ col.label }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="(row, rowIndex) in props.data" :key="rowIndex">
            <!-- 数据行 -->
            <TableRow
              :class="cn(
                props.stripe && rowIndex % 2 === 1 ? 'bg-muted/50' : '',
                isExpandable(row) ? 'cursor-pointer' : '',
                isExpanded(rowIndex) ? 'border-b-0' : ''
              )"
              @click="isExpandable(row) ? toggleRow(rowIndex) : undefined"
            >
              <!-- 展开/折叠图标列 -->
              <TableCell v-if="props.expandable" class="w-10 px-2">
                <button
                  v-if="isExpandable(row)"
                  class="inline-flex items-center justify-center size-6 rounded-md hover:bg-muted transition-transform duration-200"
                  :class="isExpanded(rowIndex) ? 'rotate-90' : ''"
                  @click.stop="toggleRow(rowIndex)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </TableCell>
              <!-- 数据列 -->
              <TableCell
                v-for="col in props.columns"
                :key="col.prop"
                :class="getCellAlignClass(col.align)"
                :style="{ textAlign: col.align, overflow: useFlexLayout ? 'hidden' : undefined }"
              >
                <SchemaRenderer v-if="isSchemaNode(row[col.prop])" :node="row[col.prop]" />
                <template v-else>{{ row[col.prop] }}</template>
              </TableCell>
            </TableRow>
            <!-- 展开内容行 -->
            <TableRow
              v-if="isExpandable(row) && isExpanded(rowIndex)"
              class="bg-muted/30 hover:bg-muted/30"
            >
              <TableCell :colspan="totalColumns" class="p-4">
                <SchemaRenderer
                  v-for="(child, childIndex) in (row._expandContent as SchemaNode[])"
                  :key="childIndex"
                  :node="child"
                />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    <slot />
  </div>
</template>

<style scoped>
/* Table cells default to left alignment for flex content */
:deep(td .flex-col) {
  align-items: flex-start;
}
/* Restore centering for explicitly center-aligned cells */
:deep(td.cell-center .flex-col) {
  align-items: center;
}
/* Right-aligned cells */
:deep(td.cell-right .flex-col) {
  align-items: flex-end;
}
</style>
