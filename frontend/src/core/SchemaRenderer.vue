<template>
  <template v-if="!node">
    <div class="tsugu-error">Schema node is null or undefined</div>
  </template>
  <component
    v-else-if="component && node.visible !== false"
    :is="component"
    :key="node.id || node.componentName"
    v-bind="mergedProps"
    :style="cssStyle"
  >
    <template v-if="node.children && node.children.length > 0">
      <SchemaRenderer
        v-for="(child, index) in node.children"
        :key="child.id || `${node.id || 'node'}-${index}`"
        :node="child"
      />
    </template>
  </component>
  <div v-else-if="!component && node" class="tsugu-error">
    Unknown component: {{ node.componentName }}
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { ComponentRegistry } from './ComponentRegistry';
import { StyleMapper } from './StyleMapper';
import { SchemaNode } from './types';

interface Props {
  node: SchemaNode | null | undefined;
}

const props = defineProps<Props>();

// 获取组件
const component = computed(() => {
  if (!props.node) return undefined;
  return ComponentRegistry.get(props.node.componentName);
});

// 合并 props
const mergedProps = computed(() => {
  if (!props.node) return {};
  return {
    ...(props.node.props || {}),
    // 将 style 也传递给组件（某些组件可能需要访问原始 style）
    _style: props.node.style,
  };
});

// 转换为 CSS 样式
const cssStyle = computed(() => {
  if (!props.node) return {};
  return StyleMapper.styleToCSS(props.node.style);
});
</script>

<style scoped>
.tsugu-error {
  padding: 8px;
  background-color: #fee;
  color: #c00;
  border: 1px solid #c00;
  border-radius: 4px;
}
</style>


