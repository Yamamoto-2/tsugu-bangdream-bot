<template>
  <div class="tsugu-wrap" :style="wrapStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface Props {
  maxWidth?: number | string;
  gap?: number | string;
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 800,
  gap: 0,
});

const wrapStyle = computed(() => {
  const style: Record<string, string> = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  };

  // 处理最大宽度
  const maxWidth = typeof props.maxWidth === 'number' 
    ? `${props.maxWidth}px` 
    : String(props.maxWidth);
  style.maxWidth = maxWidth;
  style.margin = '0 auto';

  // 处理间距
  const gap = StyleMapper.tokenToValue(props.gap);
  if (gap !== undefined) {
    style.gap = typeof gap === 'number' ? `${gap}px` : String(gap);
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
.tsugu-wrap {
  box-sizing: border-box;
}
</style>


