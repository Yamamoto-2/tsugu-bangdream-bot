<script setup lang="ts">
// 响应式容器
</script>

<template>
  <div class="ts-container">
    <slot />
  </div>
</template>

<style scoped>
.ts-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 768px) {
  .ts-container {
    padding: 0 12px;
    gap: 12px;
  }
}
</style>
