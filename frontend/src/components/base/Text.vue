<template>
  <div class="tsugu-text" :style="textStyle">
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface Props {
  text?: string;
  textSize?: number;
  maxWidth?: number | string;
  lineHeight?: number | string;
  color?: string;
  font?: 'old' | 'FangZhengHeiTi' | 'default';
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  textSize: 40,
  color: '#505050',
  font: 'old',
});

const textStyle = computed(() => {
  const style: Record<string, string> = {
    fontSize: `${props.textSize}px`,
    color: props.color,
    lineHeight: typeof props.lineHeight === 'number' 
      ? `${props.lineHeight}px` 
      : (props.lineHeight || `${props.textSize * 1.5}px`),
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  };

  // 处理最大宽度
  if (props.maxWidth !== undefined) {
    const maxWidth = typeof props.maxWidth === 'number' 
      ? `${props.maxWidth}px` 
      : String(props.maxWidth);
    style.maxWidth = maxWidth;
  }

  // 处理字体
  if (props.font === 'old') {
    style.fontFamily = 'old, "Microsoft Yahei", sans-serif';
  } else if (props.font === 'FangZhengHeiTi') {
    style.fontFamily = 'FangZhengHeiTi, "Microsoft Yahei", sans-serif';
  } else {
    style.fontFamily = '"Microsoft Yahei", sans-serif';
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
.tsugu-text {
  box-sizing: border-box;
}
</style>


