<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaNode } from './types'
import { componentMap } from '@/components'

const props = defineProps<{
  node: SchemaNode
}>()

// 获取对应的组件
const component = computed(() => {
  return componentMap[props.node.componentName]
})

// 合并 props，将 css 字段传递给组件
const mergedProps = computed(() => {
  return {
    ...props.node.props,
    css: props.node.css
  }
})

// 是否可见
const isVisible = computed(() => {
  return props.node.visible !== false
})
</script>

<template>
  <component
    v-if="component && isVisible"
    :is="component"
    :key="props.node.id || props.node.componentName"
    v-bind="mergedProps"
  >
    <!-- 递归渲染子节点 -->
    <SchemaRenderer
      v-for="(child, index) in props.node.children"
      :key="child.id || `${props.node.id}-${index}`"
      :node="child"
    />
  </component>
  <template v-else-if="!component && isVisible">
    <div class="p-3 bg-red-50 border border-red-300 rounded text-red-500 text-sm">
      Unknown component: {{ props.node.componentName }}
    </div>
  </template>
</template>
