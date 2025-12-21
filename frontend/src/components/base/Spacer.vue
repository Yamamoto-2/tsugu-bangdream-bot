<template>
  <div class="tsugu-spacer" :style="spacerStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface Props {
  height?: number | string;
  width?: number | string;
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  height: 30,
});

const spacerStyle = computed(() => {
  const style: Record<string, string> = {};

  // 处理高度
  const height = StyleMapper.tokenToValue(props.height);
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : String(height);
  }

  // 处理宽度
  const width = StyleMapper.tokenToValue(props.width);
  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : String(width);
  } else {
    style.width = '100%';
  }

  // 合并自定义样式
  if (props._style) {
    const customStyle = StyleMapper.styleToCSS(props._style);
    Object.assign(style, customStyle);
  }

  return style;
});
</script>

<style scoped>
.tsugu-spacer {
  flex-shrink: 0;
}
</style>


