<template>
  <img
    class="tsugu-image"
    :src="src"
    :alt="alt"
    :style="imageStyle"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface Props {
  src?: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'none';
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  fit: 'contain',
});

const imageStyle = computed(() => {
  const style: Record<string, string> = {
    objectFit: props.fit,
  };

  // 处理宽度
  if (props.width !== undefined) {
    const width = typeof props.width === 'number' 
      ? `${props.width}px` 
      : String(props.width);
    style.width = width;
  }

  // 处理高度
  if (props.height !== undefined) {
    const height = typeof props.height === 'number' 
      ? `${props.height}px` 
      : String(props.height);
    style.height = height;
  }

  // 合并自定义样式
  if (props._style) {
    const customStyle = StyleMapper.styleToCSS(props._style);
    Object.assign(style, customStyle);
  }

  return style;
});

const handleError = () => {
  console.warn(`Failed to load image: ${props.src}`);
};
</script>

<style scoped>
.tsugu-image {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>


