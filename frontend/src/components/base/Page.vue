<template>
  <div class="tsugu-page" :style="pageStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface Props {
  background?: string;
  useEasyBG?: boolean;
  text?: string;
  startWithSpace?: boolean;
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  useEasyBG: true,
  startWithSpace: true,
});

const pageStyle = computed(() => {
  const style: Record<string, string> = {
    minHeight: '100vh',
    width: '100%',
  };

  // 处理背景
  if (props.background) {
    style.backgroundImage = `url(${props.background})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
    style.backgroundRepeat = 'no-repeat';
  } else if (props.useEasyBG) {
    style.backgroundColor = '#fef3ef';
  }

  // 处理顶部留白
  if (props.startWithSpace) {
    style.paddingTop = '50px';
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
.tsugu-page {
  box-sizing: border-box;
}
</style>


