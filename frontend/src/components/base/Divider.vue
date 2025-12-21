<template>
  <div class="tsugu-divider" :class="dividerClass" :style="dividerStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface Props {
  type?: 'dotted' | 'solid';
  color?: string;
  height?: number | string;
  gap?: number | string;
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'dotted',
  color: '#a8a8a8',
  height: 30,
  gap: 10,
});

const dividerClass = computed(() => {
  return `tsugu-divider--${props.type}`;
});

const dividerStyle = computed(() => {
  const style: Record<string, string> = {
    width: '100%',
    height: typeof props.height === 'number' 
      ? `${props.height}px` 
      : String(props.height),
    borderTop: props.type === 'solid' 
      ? `1px solid ${props.color}` 
      : 'none',
  };

  // 虚线样式通过 CSS 实现
  if (props.type === 'dotted') {
    style.borderTop = `2px dashed ${props.color}`;
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
.tsugu-divider {
  box-sizing: border-box;
  flex-shrink: 0;
}

.tsugu-divider--dotted {
  border-top-style: dashed;
}
</style>


