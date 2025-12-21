<template>
  <div class="tsugu-row" :style="rowStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface Props {
  gap?: number | string;
  align?: 'top' | 'center' | 'bottom' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  gap: 0,
  align: 'stretch',
  justify: 'start',
});

const rowStyle = computed(() => {
  const style: Record<string, string> = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  };

  // 处理间距
  const gap = StyleMapper.tokenToValue(props.gap);
  if (gap !== undefined) {
    style.gap = typeof gap === 'number' ? `${gap}px` : String(gap);
  }

  // 处理垂直对齐
  if (props.align === 'top') {
    style.alignItems = 'flex-start';
  } else if (props.align === 'bottom') {
    style.alignItems = 'flex-end';
  } else if (props.align === 'center') {
    style.alignItems = 'center';
  } else {
    style.alignItems = 'stretch';
  }

  // 处理水平对齐
  if (props.justify === 'start') {
    style.justifyContent = 'flex-start';
  } else if (props.justify === 'end') {
    style.justifyContent = 'flex-end';
  } else if (props.justify === 'center') {
    style.justifyContent = 'center';
  } else if (props.justify === 'space-between') {
    style.justifyContent = 'space-between';
  } else if (props.justify === 'space-around') {
    style.justifyContent = 'space-around';
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
.tsugu-row {
  box-sizing: border-box;
}
</style>


