<script setup lang="ts">
import type { ContainerProps } from '@/core/types'

defineProps<ContainerProps & { css?: Record<string, any> }>()
</script>

<template>
  <div
    class="mx-auto max-w-[1200px] flex flex-col gap-3 px-3 md:gap-5 md:px-5"
    :style="css"
  >
    <slot />
  </div>
</template>
