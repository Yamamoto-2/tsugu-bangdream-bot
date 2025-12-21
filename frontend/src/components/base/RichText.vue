<template>
  <div class="tsugu-rich-text" :style="richTextStyle">
    <template v-for="(item, index) in processedContent" :key="index">
      <span v-if="typeof item === 'string'" class="tsugu-rich-text-text">
        {{ item }}
      </span>
      <img
        v-else-if="item.type === 'image'"
        :src="item.src"
        :style="imageStyle(item)"
        class="tsugu-rich-text-image"
        :alt="item.alt || ''"
      />
      <span v-else-if="item.type === 'icon'" class="tsugu-rich-text-icon">
        <img :src="item.src" :style="iconStyle(item)" :alt="item.alt || ''" />
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { StyleMapper } from '@/core/StyleMapper';

interface ContentItem {
  type?: 'image' | 'icon';
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
}

type RichTextContent = Array<string | ContentItem>;

interface Props {
  content?: RichTextContent;
  textSize?: number;
  maxWidth?: number | string;
  lineHeight?: number | string;
  spacing?: number | string;
  color?: string;
  font?: 'old' | 'FangZhengHeiTi' | 'default';
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  content: () => [],
  textSize: 40,
  color: '#505050',
  font: 'old',
  spacing: 13,
});

const processedContent = computed(() => {
  return props.content || [];
});

const richTextStyle = computed(() => {
  const style: Record<string, string> = {
    fontSize: `${props.textSize}px`,
    color: props.color,
    lineHeight: typeof props.lineHeight === 'number' 
      ? `${props.lineHeight}px` 
      : (props.lineHeight || `${props.textSize * 1.5}px`),
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    display: 'inline-block',
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

const imageStyle = (item: ContentItem) => {
  const spacing = StyleMapper.tokenToValue(props.spacing);
  const spacingPx = typeof spacing === 'number' ? spacing : 13;
  
  return {
    display: 'inline-block',
    verticalAlign: 'middle',
    height: `${props.textSize}px`,
    width: item.width ? `${item.width}px` : 'auto',
    marginLeft: `${spacingPx}px`,
    marginRight: `${spacingPx}px`,
  };
};

const iconStyle = (item: ContentItem) => {
  return {
    display: 'inline-block',
    verticalAlign: 'middle',
    height: `${props.textSize}px`,
    width: item.width ? `${item.width}px` : 'auto',
  };
};
</script>

<style scoped>
.tsugu-rich-text {
  box-sizing: border-box;
}

.tsugu-rich-text-text {
  display: inline;
}

.tsugu-rich-text-image,
.tsugu-rich-text-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>


