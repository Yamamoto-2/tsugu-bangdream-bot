<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { ImageProps } from '@/core/types'

interface TsImageProps extends ImageProps {
  css?: CSSProperties;
}

const props = withDefaults(defineProps<TsImageProps>(), {
  fit: 'contain',
  lazy: true
})

// 合并内部样式和外部 css，css 优先级更高
const mergedStyle = computed<CSSProperties>(() => {
  const baseStyle: CSSProperties = {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return { ...baseStyle, ...props.css }
})
</script>

<template>
  <el-image
    :src="props.src"
    :fit="props.fit"
    :alt="props.alt"
    :lazy="props.lazy"
    :preview-src-list="props.previewSrcList"
    :style="mergedStyle"
    class="ts-image"
  >
    <template #error>
      <div class="image-error">
        <el-icon><Picture /></el-icon>
      </div>
    </template>
    <template #placeholder>
      <div class="image-placeholder">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
    </template>
  </el-image>
</template>

<style scoped>
.ts-image {
  display: block;
  max-width: 100%;
}

.image-error,
.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 24px;
}
</style>
