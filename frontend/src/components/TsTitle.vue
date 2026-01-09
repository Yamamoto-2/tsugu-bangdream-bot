<script setup lang="ts">
import type { TitleProps } from '@/core/types'

const props = withDefaults(defineProps<TitleProps>(), {
  level: 2
})

const Tag = `h${props.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
</script>

<template>
  <component :is="Tag" class="ts-title">
    {{ props.content }}
    <slot />
  </component>
</template>

<style scoped>
.ts-title {
  margin: 0 0 16px 0;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

h1.ts-title { font-size: 28px; }
h2.ts-title { font-size: 24px; }
h3.ts-title { font-size: 20px; }
h4.ts-title { font-size: 18px; }
h5.ts-title { font-size: 16px; }
h6.ts-title { font-size: 14px; }

@media (max-width: 768px) {
  h1.ts-title { font-size: 24px; }
  h2.ts-title { font-size: 20px; }
  h3.ts-title { font-size: 18px; }
  h4.ts-title { font-size: 16px; }
}
</style>
