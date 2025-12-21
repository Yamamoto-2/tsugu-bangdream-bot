<template>
  <div class="tsugu-column" :style="columnStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface Props {
  gap?: number | string;
  align?: 'left' | 'center' | 'right' | 'stretch';
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  gap: 30,
  align: 'stretch',
});

const columnStyle = computed(() => {
  const style: Record<string, string> = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  };

  // 处理间距
  const gap = StyleMapper.tokenToValue(props.gap);
  if (gap !== undefined) {
    style.gap = typeof gap === 'number' ? `${gap}px` : String(gap);
  }

  // 处理对齐
  if (props.align === 'left') {
    style.alignItems = 'flex-start';
  } else if (props.align === 'right') {
    style.alignItems = 'flex-end';
  } else if (props.align === 'center') {
    style.alignItems = 'center';
  } else {
    style.alignItems = 'stretch';
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
.tsugu-column {
  box-sizing: border-box;
}
</style>


