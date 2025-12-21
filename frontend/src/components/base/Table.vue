<template>
  <div class="tsugu-table" :style="tableStyle">
    <div v-if="key" class="tsugu-table-key">
      <Badge :text="key" :text-size="30" />
    </div>
    <div v-if="text || content" class="tsugu-table-value" :style="valueStyle">
      <Text v-if="text" :text="text" :text-size="textSize" :max-width="maxWidth" :line-height="lineHeight" :color="color" />
      <RichText v-else-if="content" :content="content" :text-size="textSize" :max-width="maxWidth" :line-height="lineHeight" :spacing="spacing" :color="color" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';
import Badge from './Badge.vue';
import Text from './Text.vue';
import RichText from './RichText.vue';

interface Props {
  key?: string;
  text?: string;
  content?: Array<string | { type: 'image' | 'icon'; src: string; width?: number; height?: number }>;
  textSize?: number;
  lineHeight?: number | string;
  spacing?: number | string;
  color?: string;
  maxWidth?: number | string;
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  textSize: 40,
  color: '#505050',
  maxWidth: 800,
  spacing: 13,
});

const tableStyle = computed(() => {
  const style: Record<string, string> = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  // 合并自定义样式
  if (props._style) {
    const customStyle = StyleMapper.styleToCSS(props._style);
    Object.assign(style, customStyle);
  }

  return style;
});

const valueStyle = computed(() => {
  const style: Record<string, string> = {
    marginLeft: props.key ? '20px' : '0',
  };

  return style;
});
</script>

<style scoped>
.tsugu-table {
  box-sizing: border-box;
}

.tsugu-table-key {
  display: inline-block;
}

.tsugu-table-value {
  flex: 1;
}
</style>


