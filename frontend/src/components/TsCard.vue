<script setup lang="ts">
import type { CardProps } from '@/core/types'

const props = withDefaults(defineProps<CardProps>(), {
  shadow: 'hover'
})
</script>

<template>
  <el-card
    :shadow="props.shadow"
    :body-style="props.bodyStyle"
    class="ts-card"
  >
    <template v-if="props.header" #header>
      <div class="card-header">
        {{ props.header }}
      </div>
    </template>
    <slot />
  </el-card>
</template>

<style scoped>
.ts-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
}

@media (max-width: 768px) {
  .ts-card {
    margin-bottom: 12px;
  }

  .ts-card :deep(.el-card__body) {
    padding: 12px;
  }
}
</style>
