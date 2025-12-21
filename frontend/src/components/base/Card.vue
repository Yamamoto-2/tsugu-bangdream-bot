<template>
  <div class="tsugu-card" :style="cardStyle">
    <div v-if="topLeftText" class="tsugu-card-header" :style="headerStyle">
      {{ topLeftText }}
    </div>
    <div class="tsugu-card-content" :style="contentStyle">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface Props {
  title?: string;
  topLeftText?: string;
  opacity?: number;
  showBackground?: boolean;
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  opacity: 0.9,
  showBackground: true,
});

const cardStyle = computed(() => {
  const style: Record<string, string> = {
    width: '100%',
    boxSizing: 'border-box',
  };

  if (props.showBackground) {
    style.backgroundColor = 'rgba(255, 255, 255, ' + props.opacity + ')';
    style.borderRadius = '25px';
    style.padding = '50px';
  }

  // 合并自定义样式
  if (props._style) {
    const customStyle = StyleMapper.styleToCSS(props._style);
    Object.assign(style, customStyle);
  }

  return style;
});

const headerStyle = computed(() => {
  return {
    backgroundColor: '#ea4e73',
    color: '#ffffff',
    padding: '5px 20px',
    borderRadius: '25px 25px 0 0',
    marginBottom: '0',
    fontSize: '40px',
    textAlign: 'center' as const,
    fontFamily: 'old, "Microsoft Yahei", sans-serif',
  };
});

const contentStyle = computed(() => {
  return {
    width: '100%',
  };
});
</script>

<style scoped>
.tsugu-card {
  box-sizing: border-box;
}
</style>


