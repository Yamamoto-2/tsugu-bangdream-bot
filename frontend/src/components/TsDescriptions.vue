<script setup lang="ts">
import { computed } from 'vue'
import type { DescriptionsProps } from '@/core/types'

const props = withDefaults(defineProps<DescriptionsProps>(), {
  column: 3,
  direction: 'horizontal',
  size: 'default',
  border: true
})

// 响应式列数
const responsiveColumn = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return 1
  }
  return props.column
})
</script>

<template>
  <el-descriptions
    :title="props.title"
    :column="responsiveColumn"
    :direction="props.direction"
    :size="props.size"
    :border="props.border"
    class="ts-descriptions"
  >
    <el-descriptions-item
      v-for="(item, index) in props.items"
      :key="index"
      :label="item.label"
      :span="item.span"
    >
      {{ item.value }}
    </el-descriptions-item>
    <slot />
  </el-descriptions>
</template>

<style scoped>
.ts-descriptions {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .ts-descriptions {
    margin-bottom: 12px;
  }
}
</style>
