<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'
import type { ImageProps } from '@/core/types'
import { ImageOff, Loader2 } from 'lucide-vue-next'

interface TsImageProps extends ImageProps {
  css?: CSSProperties
}

const props = withDefaults(defineProps<TsImageProps>(), {
  fit: 'contain',
  lazy: true
})

const loaded = ref(false)
const errored = ref(false)

const mergedStyle = computed<CSSProperties>(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  objectFit: props.fit,
  ...props.css
}))
</script>

<template>
  <div class="relative block max-w-full" :style="{ width: mergedStyle.width, height: mergedStyle.height }">
    <img
      v-if="!errored"
      :src="props.src"
      :alt="props.alt"
      :loading="props.lazy ? 'lazy' : 'eager'"
      class="block max-w-full"
      :style="mergedStyle"
      @load="loaded = true"
      @error="errored = true"
    />
    <div
      v-if="!loaded && !errored"
      class="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground"
    >
      <Loader2 class="size-6 animate-spin" />
    </div>
    <div
      v-if="errored"
      class="flex items-center justify-center bg-muted text-muted-foreground"
      :style="{ width: mergedStyle.width, height: mergedStyle.height }"
    >
      <ImageOff class="size-6" />
    </div>
  </div>
</template>
