<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AlertTriangle } from 'lucide-vue-next'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen gap-4">
    <AlertTriangle class="size-24 text-muted-foreground" />
    <p class="text-muted-foreground text-lg">页面不存在</p>
    <button
      class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
      @click="goHome"
    >
      返回首页
    </button>
  </div>
</template>
