<template>
  <div class="tsugu-badge" :style="badgeStyle">
    <span class="tsugu-badge-text" :style="textStyle">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface Props {
  text?: string;
  textSize?: number;
  color?: string;
  textColor?: string;
  radius?: number | string;
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  textSize: 30,
  color: '#5b5b5b',
  textColor: '#ffffff',
});

const badgeStyle = computed(() => {
  const style: Record<string, string> = {
    display: 'inline-block',
    backgroundColor: props.color,
    padding: '0 8px',
    borderRadius: typeof props.radius === 'number' 
      ? `${props.radius}px` 
      : (props.radius || 'auto'),
  };

  // 如果 radius 是 auto，根据 textSize 计算
  if (!props.radius) {
    style.borderRadius = `${props.textSize * 0.67}px`;
  }

  // 合并自定义样式
  if (props._style) {
    const customStyle = StyleMapper.styleToCSS(props._style);
    Object.assign(style, customStyle);
  }

  return style;
});

const textStyle = computed(() => {
  return {
    fontSize: `${props.textSize}px`,
    color: props.textColor,
    lineHeight: `${props.textSize * 1.33}px`,
    fontFamily: 'old, "Microsoft Yahei", sans-serif',
  };
});
</script>

<style scoped>
.tsugu-badge {
  box-sizing: border-box;
}
</style>


