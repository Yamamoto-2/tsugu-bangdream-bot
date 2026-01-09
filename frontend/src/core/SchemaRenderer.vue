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

// 合并 props
const mergedProps = computed(() => {
  return {
    ...props.node.props,
    style: props.node.style
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
    <div class="unknown-component">
      Unknown component: {{ props.node.componentName }}
    </div>
  </template>
</template>

<style scoped>
.unknown-component {
  padding: 12px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 14px;
}
</style>
