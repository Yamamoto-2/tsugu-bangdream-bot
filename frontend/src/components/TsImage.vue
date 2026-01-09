<script setup lang="ts">
import type { ImageProps } from '@/core/types'

const props = withDefaults(defineProps<ImageProps>(), {
  fit: 'contain',
  lazy: true
})

const imageStyle = {
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}
</script>

<template>
  <el-image
    :src="props.src"
    :fit="props.fit"
    :alt="props.alt"
    :lazy="props.lazy"
    :preview-src-list="props.previewSrcList"
    :style="imageStyle"
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
