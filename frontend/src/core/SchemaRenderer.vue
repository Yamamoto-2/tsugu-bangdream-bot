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

// href 相关
const href = computed(() => props.node.href)
const isInternal = computed(() => href.value?.startsWith('/'))
</script>

<template>
  <!-- 有 href: 用 router-link 或 a 包裹 -->
  <router-link
    v-if="component && isVisible && href && isInternal"
    :to="href"
    class="contents"
  >
    <component
      :is="component"
      :key="props.node.id || props.node.componentName"
      v-bind="mergedProps"
    >
      <SchemaRenderer
        v-for="(child, index) in props.node.children"
        :key="child.id || `${props.node.id}-${index}`"
        :node="child"
      />
    </component>
  </router-link>
  <a
    v-else-if="component && isVisible && href"
    :href="href"
    class="contents"
  >
    <component
      :is="component"
      :key="props.node.id || props.node.componentName"
      v-bind="mergedProps"
    >
      <SchemaRenderer
        v-for="(child, index) in props.node.children"
        :key="child.id || `${props.node.id}-${index}`"
        :node="child"
      />
    </component>
  </a>
  <!-- 无 href: 正常渲染 -->
  <component
    v-else-if="component && isVisible"
    :is="component"
    :key="props.node.id || props.node.componentName"
    v-bind="mergedProps"
  >
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
